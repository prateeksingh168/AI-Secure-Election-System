import { useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  LockKeyhole,
  ScanFace,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";
import { api } from "./services/api";
import "./App.css";

const startingCandidates = [
  {
    candidate_id: "C001",
    name: "Aarav Sharma",
    party: "Progress Alliance",
    symbol: "ðŸŒ±",
    color: "#17705c",
    votes: 0,
  },
  {
    candidate_id: "C002",
    name: "Meera Nair",
    party: "People First Party",
    symbol: "â˜€ï¸",
    color: "#b56135",
    votes: 0,
  },
  {
    candidate_id: "C003",
    name: "Kabir Khan",
    party: "National Development Front",
    symbol: "âš™ï¸",
    color: "#3e62af",
    votes: 0,
  },
];

function App() {
  const [screen, setScreen] = useState("login");
  const [role, setRole] = useState("voter");

  const [voterId, setVoterId] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [alreadyVotedPopup, setAlreadyVotedPopup] = useState(false);

  const [chosen, setChosen] = useState(null);
  const [candidates, setCandidates] = useState(startingCandidates);

  const [face, setFace] = useState(null);
  const [biometricToken, setBiometricToken] = useState(null);

  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);

  const [adminTab, setAdminTab] = useState("analytics");

  const [analytics, setAnalytics] = useState(null);
  const [elections, setElections] = useState([]);

  const [audit, setAudit] = useState([]);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello! Ask me about voting criteria, voting process, face verification, receipt, or analytics.",
    },
  ]);

  const [voteReceipt, setVoteReceipt] = useState(null);
  const [voteError, setVoteError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const selected = candidates.find(
    (candidate) =>
      String(candidate.candidate_id ?? candidate.id) === String(chosen)
  );

  /*
   * LOGIN
   * Real backend authentication.
   */
  const login = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    setLoginError("");
    setLoading(true);

    try {
      let email = voterId.trim();

      if (!email.includes("@")) {
        email =
          role === "admin"
            ? "admin@demo-election.local"
            : "voter001@demo-election.local";
      }

      const finalPassword = password || "password123";

      const loginResponse = await api.login({
        email,
        password: finalPassword,
        portal: role.toUpperCase(),
      });

      console.log("LOGIN RESPONSE:", loginResponse);

      if (!loginResponse?.access_token) {
        throw new Error("Backend did not return an access token.");
      }

      localStorage.setItem("token", loginResponse.access_token);

      if (loginResponse.refresh_token) {
        localStorage.setItem("refresh_token", loginResponse.refresh_token);
      }

      localStorage.setItem("login_email", email);

      /*
       * ADMIN
       */
      if (role === "admin") {
        await loadAdminData();
        setScreen("admin");
        return;
      }

      /*
       * VOTER
       */
      localStorage.setItem("voter_id", loginResponse.voter_id || "V001");

      const eligibility = await api.getEligibility("E001");

      console.log("ELIGIBILITY RESPONSE:", eligibility);

      if (eligibility?.has_voted) {
        setAlreadyVotedPopup(true);
        return;
      }

      if (eligibility?.eligible === false) {
        setLoginError(
          "You are not eligible to vote in this election."
        );
        return;
      }

      const realCandidates = await api.getCandidates("E001");

      console.log("CANDIDATES RESPONSE:", realCandidates);

      if (Array.isArray(realCandidates) && realCandidates.length > 0) {
        setCandidates(
          realCandidates.map((candidate, index) => ({
            candidate_id:
              candidate.candidate_id ??
              candidate.id ??
              `C00${index + 1}`,
            name: candidate.name ?? candidate.candidate_name ?? "Candidate",
            party: candidate.party ?? candidate.party_name ?? "",
            symbol: candidate.symbol ?? "ðŸ—³ï¸",
            color:
              candidate.color ??
              startingCandidates[index % startingCandidates.length].color,
            votes: Number(
              candidate.votes ??
              candidate.vote_count ??
              candidate.total_votes ??
              0
            ),
          }))
        );
      }

      setScreen("election");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setLoginError(
        error.response?.data?.detail ||
        error.message ||
        "Unable to connect to election server."
      );

      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ADMIN DATA
   */
  const loadAdminData = async () => {
    try {
      const [electionData, resultData, auditData] = await Promise.all([
        api.getElections(),
        api.getAnalytics("E001"),
        api.getAuditLogs("E001"),
      ]);

      console.log("ELECTIONS:", electionData);
      console.log("ANALYTICS:", resultData);
      console.log("AUDIT LOGS:", auditData);

      /*
       * ELECTIONS
       * Backend may return either:
       * - Array
       * - { value: [...] }
       */
      const realElections = Array.isArray(electionData)
        ? electionData
        : electionData?.value ?? [];

      setElections(realElections);

      /*
       * RESULTS / ANALYTICS
       */
      setAnalytics(resultData);

      /*
       * AUDIT LOGS
       */
      const realAuditLogs = Array.isArray(auditData)
        ? auditData
        : [];

      setAudit(realAuditLogs);

      /*
       * CANDIDATE RESULTS
       * Backend returns candidate_results
       */
      const realCandidates = Array.isArray(resultData?.candidate_results)
        ? resultData.candidate_results
        : [];

      if (realCandidates.length > 0) {
        setCandidates(
          realCandidates.map((candidate, index) => ({
            candidate_id:
              candidate.candidate_id ??
              candidate.id ??
              `C00${index + 1}`,

            name:
              candidate.name ??
              candidate.candidate_name ??
              "Candidate",

            party:
              candidate.party ??
              candidate.party_name ??
              "",

            symbol:
              candidate.symbol ??
              "ðŸ—³ï¸",

            color:
              candidate.color ??
              startingCandidates[
                index % startingCandidates.length
              ].color,

            votes: Number(
              candidate.votes ??
              candidate.vote_count ??
              candidate.total_votes ??
              0
            ),
          }))
        );
      }
    } catch (error) {
      console.error("ADMIN DATA ERROR:", error);
    }
  };
  /*
   * CAMERA
   */
  const startCamera = async () => {
    setCameraError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not available.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (!videoRef.current) {
        throw new Error("Video element unavailable.");
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (error) {
      console.error("CAMERA ERROR:", error);

      setCameraError(
        "Camera permission allow karo, phir Start Camera dobara click karo."
      );
    }
  };

  /*
   * FACE CAPTURE
   */
  const captureFace = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video?.srcObject) {
      setCameraError("Pehle Start Camera click karo.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setCameraError(
        "Camera frame ready nahi hai. Thoda wait karke dobara try karo."
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to process camera frame.");
      return;
    }

    context.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL("image/jpeg", 0.85);

    setFace(imageBase64);

    video.srcObject.getTracks().forEach((track) => track.stop());
    video.srcObject = null;

    /*
     * REAL BIOMETRIC VERIFICATION
     */
    setLoading(true);
    setCameraError("");

    try {
      const currentVoterId =
        localStorage.getItem("voter_id") ||
        voterId.trim() ||
        "V001";

      const response = await api.verifyBiometric({
        voter_id: currentVoterId,
        biometric_data: {
          method: "FACE",
          image_base64: imageBase64,
        },
      });

      console.log("BIOMETRIC RESPONSE:", response);

      if (!response?.verified) {
        setBiometricToken(null);
        setCameraError(
          response?.message ||
          "Face verification failed. Please capture again."
        );
        return;
      }

      setBiometricToken(response.biometric_token || null);
      setScreen("confirm");
    } catch (error) {
      console.error("BIOMETRIC ERROR:", error);

      setCameraError(
        error.response?.data?.detail ||
        error.message ||
        "Face verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * REAL VOTE CASTING
   */
  const castVote = async () => {
    if (!chosen) {
      setVoteError("Please select a candidate.");
      return;
    }

    if (!biometricToken) {
      setVoteError(
        "Face verification required before casting the vote."
      );
      return;
    }

    setVoteError("");
    setLoading(true);

    try {
      const candidateId = selected?.candidate_id ?? selected?.id;

      const response = await api.castVote(
        {
          candidate_id: String(candidateId),
          biometric_token: biometricToken,
        },
        "E001"
      );

      console.log("REAL VOTE RESPONSE:", response);

      setVoteReceipt(
        response?.vote_id ||
        `VSR-${Date.now()}`
      );

      /*
       * Refresh analytics/candidates from backend
       */
      try {
        const updatedCandidates = await api.getCandidates("E001");

        if (
          Array.isArray(updatedCandidates) &&
          updatedCandidates.length > 0
        ) {
          setCandidates(
            updatedCandidates.map((candidate, index) => ({
              candidate_id:
                candidate.candidate_id ??
                candidate.id ??
                `C00${index + 1}`,
              name:
                candidate.name ??
                candidate.candidate_name ??
                "Candidate",
              party:
                candidate.party ??
                candidate.party_name ??
                "",
              symbol: candidate.symbol ?? "ðŸ—³ï¸",
              color:
                candidate.color ??
                startingCandidates[
                  index % startingCandidates.length
                ].color,
              votes: Number(
                candidate.votes ??
                candidate.vote_count ??
                candidate.total_votes ??
                0
              ),
            }))
          );
        }
      } catch (refreshError) {
        console.warn(
          "Could not refresh candidates:",
          refreshError
        );
      }

      setScreen("success");
    } catch (error) {
      console.error("VOTE ERROR:", error);

      setVoteError(
        error.response?.data?.detail ||
        error.message ||
        "Vote casting failed."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * AI ASSISTANT
   */
  const sendChat = async () => {
    if (!chatInput.trim()) return;

    const question = chatInput.trim();

    setMessages((oldMessages) => [
      ...oldMessages,
      { from: "user", text: question },
    ]);

    setChatInput("");

    try {
      const response = await api.askAssistant(question, "E001");

      console.log("AI RESPONSE:", response);

      let reply =
        "I can help with voting criteria, voting process, face verification, receipts, candidates, election rules, and election information.";

      if (typeof response === "string") {
        reply = response;
      } else if (response?.answer) {
        reply = response.answer;
      } else if (response?.context?.answer) {
        reply = response.context.answer;
      } else if (response?.context?.message) {
        reply = response.context.message;
      } else if (typeof response?.context === "string") {
        reply = response.context;
      }

      setMessages((oldMessages) => [
        ...oldMessages,
        { from: "bot", text: reply },
      ]);
    } catch (error) {
      console.error("AI ERROR:", error);

      setMessages((oldMessages) => [
        ...oldMessages,
        {
          from: "bot",
          text:
            "AI service is currently unavailable. Please try again.",
        },
      ]);
    }
  };

  /*
   * LOGOUT
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("login_email");
    localStorage.removeItem("voter_id");

    setScreen("login");
    setRole("voter");
    setVoterId("");
    setPassword("");
    setFace(null);
    setBiometricToken(null);
    setChosen(null);
    setVoteReceipt(null);
    setVoteError("");
  };

  /*
   * ANALYTICS
   */
  const totalVotes =
    analytics?.total_votes ??
    analytics?.totalVotes ??
    candidates.reduce(
      (sum, candidate) => sum + Number(candidate.votes || 0),
      0
    );

  const totalVoters =
    analytics?.total_eligible_voters ??
    analytics?.total_voters ??
    analytics?.totalVoters ??
    analytics?.eligible_voters ??
    0;
  const turnout =
    analytics?.turnout ??
    analytics?.turnout_percentage ??
    (
      totalVoters > 0
        ? (Number(totalVotes) / Number(totalVoters)) * 100
        : 0
    ).toFixed(1);

  const Header = () => (
    <header className="topbar">
      <div className="brand">
        <div className="logo">
          <Vote />
        </div>

        <div>
          <b>VoteSphere</b>
          <small>Secure Digital Elections</small>
        </div>
      </div>

      <div className="secure">
        <LockKeyhole size={15} />
        Secure Session
      </div>
    </header>
  );

  return (
    <main>
      {alreadyVotedPopup && (
        <div className="modal-overlay">
          <div className="already-voted-modal">
            <div className="modal-icon">
              <ShieldCheck size={42} />
            </div>

            <span className="eyebrow">VOTING STATUS</span>

            <h2>You have already voted</h2>

            <p>
              Your vote for this election has already been
              recorded. You cannot participate again in the
              same election.
            </p>

            <button
              className="primary full"
              onClick={() => {
                setAlreadyVotedPopup(false);
                logout();
              }}
            >
              Return to Login
            </button>
          </div>
        </div>
      )}

      {screen !== "login" && <Header />}

      {/* LOGIN */}
      {screen === "login" && (
        <section className="login-page">
          <div className="hero">
            <div className="brand">
              <div className="logo gold">
                <Vote />
              </div>

              <div>
                <b>VoteSphere</b>
                <small>Secure Digital Elections</small>
              </div>
            </div>

            <div className="hero-text">
              <span className="badge">
                ðŸ›¡ï¸ EDUCATIONAL PROTOTYPE
              </span>

              <h1>
                Vote with confidence.
                <i> Every voice matters.</i>
              </h1>

              <p>
                Secure, accessible and intelligent election
                experience.
              </p>
            </div>
          </div>

          <div className="login-side">
            <form className="card" onSubmit={login}>
              <span className="eyebrow">SECURE ACCESS</span>

              <h2>Choose your portal</h2>

              <p className="muted">
                Select your role before signing in.
              </p>

              <div className="roles">
                <button
                  type="button"
                  className={
                    role === "voter" ? "selected" : ""
                  }
                  onClick={() => setRole("voter")}
                >
                  <Vote />
                  <b>Voter</b>
                  <small>Cast your vote</small>
                </button>

                <button
                  type="button"
                  className={
                    role === "admin" ? "selected" : ""
                  }
                  onClick={() => setRole("admin")}
                >
                  <BarChart3 />
                  <b>Admin</b>
                  <small>View analytics</small>
                </button>
              </div>

              <label>
                {role === "admin"
                  ? "Admin ID / Email"
                  : "Voter ID / Email"}
              </label>

              <input
                value={voterId}
                onChange={(event) =>
                  setVoterId(event.target.value)
                }
                placeholder={
                  role === "admin"
                    ? "admin@demo-election.local"
                    : "V001 or voter001@demo-election.local"
                }
              />

              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter password"
              />

              {loginError && (
                <p className="login-error">{loginError}</p>
              )}

              <button
                type="submit"
                className="primary full"
                disabled={loading}
              >
                {loading
                  ? "Connecting..."
                  : `Continue as ${role === "admin" ? "Admin" : "Voter"
                  }`}

                {!loading && <ArrowRight size={18} />}
              </button>

              <p className="note">
                Demo voter:
                voter001@demo-election.local / password123
              </p>

              <p className="note">
                Demo admin:
                admin@demo-election.local / password123
              </p>
            </form>
          </div>
        </section>
      )}

      {/* ELECTION */}
      {screen === "election" && (
        <section className="page">
          <span className="eyebrow">VOTER DASHBOARD</span>

          <h1>Hello, {voterId || "Voter"}! ðŸ‘‹</h1>

          <p className="muted">
            You are verified and eligible to vote.
          </p>

          <div className="election-card">
            <div className="iconbox">
              <Vote />
            </div>

            <div>
              <span className="live">LIVE</span>

              <h2>
                Student Council General Election 2026
              </h2>

              <p>
                Choose one representative for the Student
                Council.
              </p>

              <small>
                Election data is loaded from backend.
              </small>
            </div>

            <button
              className="primary"
              onClick={() => setScreen("candidates")}
            >
              Select Election
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* CANDIDATES */}
      {screen === "candidates" && (
        <section className="page">
          <span className="eyebrow">STEP 1 OF 4</span>

          <h1>Select your candidate</h1>

          <p className="muted">
            Candidates are loaded from the election database.
          </p>

          <div className="candidate-grid">
            {candidates.map((candidate) => {
              const id =
                candidate.candidate_id ?? candidate.id;

              return (
                <button
                  key={id}
                  className={`candidate ${String(chosen) === String(id)
                    ? "chosen"
                    : ""
                    }`}
                  onClick={() => setChosen(id)}
                >
                  {String(chosen) === String(id) && (
                    <CheckCircle2 className="tick" />
                  )}

                  <div
                    className="avatar"
                    style={{
                      background:
                        candidate.color || "#17705c",
                    }}
                  >
                    {candidate.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <span className="symbol">
                    {candidate.symbol || "ðŸ—³ï¸"}
                  </span>

                  <h2>{candidate.name}</h2>

                  <p>{candidate.party}</p>
                </button>
              );
            })}
          </div>

          <div className="actions">
            <button
              className="secondary"
              onClick={() => setScreen("election")}
            >
              Back
            </button>

            <button
              className="primary"
              disabled={!chosen}
              onClick={() => setScreen("face")}
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* FACE */}
      {screen === "face" && (
        <section className="page center">
          <div className="card face-card">
            <span className="eyebrow">
              STEP 2 OF 4 â€” FACE VERIFICATION
            </span>

            <h1>Verify your face</h1>

            <p className="muted">
              Camera image will be sent to the backend
              biometric verification endpoint.
            </p>

            {!face ? (
              <>
                <video
                  ref={videoRef}
                  className="camera"
                  autoPlay
                  playsInline
                />

                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {cameraError && (
                  <p className="error">{cameraError}</p>
                )}

                <div className="camera-actions">
                  <button
                    className="secondary"
                    onClick={startCamera}
                    disabled={loading}
                  >
                    <Camera size={18} />
                    Start Camera
                  </button>

                  <button
                    className="primary"
                    onClick={captureFace}
                    disabled={loading}
                  >
                    <ScanFace size={18} />
                    {loading
                      ? "Verifying..."
                      : "Capture & Verify"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <img
                  className="camera"
                  src={face}
                  alt="Captured face preview"
                />

                {cameraError && (
                  <p className="error">{cameraError}</p>
                )}

                {biometricToken && (
                  <p className="privacy">
                    <ShieldCheck size={18} />
                    Face verification successful.
                  </p>
                )}

                <button
                  className="secondary"
                  onClick={() => {
                    setFace(null);
                    setBiometricToken(null);
                    setCameraError("");
                  }}
                >
                  Capture Again
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* CONFIRM */}
      {screen === "confirm" && selected && (
        <section className="page center">
          <div className="card face-card">
            <span className="eyebrow">
              STEP 3 OF 4 â€” FINAL REVIEW
            </span>

            <h1>Confirm your vote</h1>

            <div className="selected-candidate">
              <div
                className="avatar"
                style={{
                  background:
                    selected.color || "#17705c",
                }}
              >
                {selected.name
                  ?.split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div>
                <small>SELECTED CANDIDATE</small>
                <h2>{selected.name}</h2>
                <p>{selected.party}</p>
              </div>

              <span className="symbol">
                {selected.symbol || "ðŸ—³ï¸"}
              </span>
            </div>

            <p className="checks">
              âœ“ Voter eligible &nbsp;
              âœ“ Face verified &nbsp;
              âœ“ Duplicate check complete
            </p>

            {voteError && (
              <p className="error">{voteError}</p>
            )}

            <button
              className="danger"
              onClick={castVote}
              disabled={loading}
            >
              {loading
                ? "Submitting Vote..."
                : "Cast Final Vote"}

              {!loading && <Vote size={18} />}
            </button>
          </div>
        </section>
      )}

      {/* SUCCESS */}
      {screen === "success" && (
        <section className="page center">
          <div className="card face-card">
            <div className="success">
              <CheckCircle2 size={65} />
            </div>

            <span className="eyebrow">
              VOTE CONFIRMATION
            </span>

            <h1>Your vote has been recorded</h1>

            <p className="muted">
              Your vote was successfully submitted to the
              backend.
            </p>

            <div className="receipt">
              <small>VOTE / RECEIPT ID</small>

              <b>
                {voteReceipt || "Generated by backend"}
              </b>
            </div>

            <button
              className="primary"
              onClick={logout}
            >
              Return to Login
            </button>
          </div>
        </section>
      )}

      {/* ADMIN */}
      {screen === "admin" && (
        <section className="page">
          <div className="admin-head">
            <div>
              <span className="eyebrow">ADMIN PORTAL</span>

              <h1>Election Management</h1>

              <p className="muted">
                Monitor participation and vote analytics.
              </p>
            </div>

            <button
              className="secondary"
              onClick={logout}
            >
              Logout
            </button>
          </div>

          <div className="tabs">
            <button
              className={
                adminTab === "analytics" ? "active" : ""
              }
              onClick={() => {
                setAdminTab("analytics");
                loadAdminData();
              }}
            >
              <BarChart3 size={17} />
              Analytics
            </button>

            <button
              className={
                adminTab === "database" ? "active" : ""
              }
              onClick={() => setAdminTab("database")}
            >
              <Users size={17} />
              Voter Database
            </button>
          </div>

          {adminTab === "analytics" && (
            <>
              <div className="metrics">
                <div>
                  <small>Total votes cast</small>
                  <b>{totalVotes}</b>
                  <span>Backend data</span>
                </div>

                <div>
                  <small>Eligible voters</small>
                  <b>{totalVoters}</b>
                  <span>Registered voters</span>
                </div>

                <div>
                  <small>Voter turnout</small>
                  <b>
                    {typeof turnout === "number"
                      ? turnout.toFixed(1)
                      : turnout}
                    %
                  </b>
                  <span>Participation rate</span>
                </div>
              </div>

              <div className="panel">
                <h2>Candidate-wise vote distribution</h2>

                {candidates.map((candidate) => {
                  const votes = Number(
                    candidate.votes || 0
                  );

                  const percentage =
                    Number(totalVotes) > 0
                      ? (
                        (votes / Number(totalVotes)) *
                        100
                      ).toFixed(1)
                      : "0.0";

                  return (
                    <div
                      className="chart"
                      key={
                        candidate.candidate_id ??
                        candidate.id
                      }
                    >
                      <div>
                        <span>
                          {candidate.symbol}{" "}
                          {candidate.name}
                        </span>

                        <b>
                          {votes} votes ({percentage}%)
                        </b>
                      </div>

                      <div className="track">
                        <i
                          style={{
                            width: `${percentage}%`,
                            background:
                              candidate.color ||
                              "#17705c",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {elections.length > 0 && (
                <div className="panel">
                  <h2>Available Elections</h2>
                  {elections.map((election) => (
                    <div
                      className="summary"
                      key={election.election_id}
                    >
                      <div>
                        <strong>
                          {election.title ||
                            election.name ||
                            "Election"}
                        </strong>

                        <div
                          className="muted"
                          style={{ marginTop: "6px" }}
                        >
                          {"\u{1F4C5}"}{" "}
                          {election.start_date
                            ? new Date(
                              `${election.start_date}T00:00:00`
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : "Start date unavailable"}
                          {" – "}
                          {election.end_date
                            ? new Date(
                              `${election.end_date}T00:00:00`
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : "End date unavailable"}
                        </div>
                      </div>

                      <span
                        className={
                          election.status === "ACTIVE"
                            ? "green"
                            : ""
                        }
                      >
                        {"\u{1F7E2}"}{" "}
                        {election.status || "UNKNOWN"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {adminTab === "database" && (
            <div className="panel">
              <h2>Voter Database</h2>

              <p className="muted">
                Participation details only. Candidate choices remain private.
              </p>

              <div className="summary">
                <span>
                  ✓ Backend authentication active
                </span>

                <span>
                  🛡️ Biometric verification active
                </span>

                <span>
                  🔐 Duplicate voting protection active
                </span>
              </div>

              {audit.length > 0 ? (
                <div
                  className="table"
                  style={{
                    width: "100%",
                    overflowX: "auto",
                  }}
                >
                  <div
                    className="table-row head"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 2fr 1fr 2fr 1fr",
                      gap: "16px",
                      minWidth: "850px",
                    }}
                  >
                    <span>Actor ID</span>
                    <span>Action</span>
                    <span>Status</span>
                    <span>Date & Time</span>
                    <span>Election</span>
                  </div>

                  {audit.map((log) => (
                    <div
                      className="table-row"
                      key={
                        log.log_id ||
                        `${log.actor_id}-${log.timestamp}`
                      }
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 2fr 1fr 2fr 1fr",
                        gap: "16px",
                        minWidth: "850px",
                      }}
                    >
                      <span>
                        {log.actor_id || "System"}
                      </span>

                      <span>
                        {log.action || "UNKNOWN"}
                      </span>

                      <span
                        className={
                          log.status === "SUCCESS"
                            ? "green"
                            : "error"
                        }
                      >
                        {log.status === "SUCCESS"
                          ? "✓ Success"
                          : "✕ Failed"}
                      </span>

                      <span>
                        {log.timestamp
                          ? new Date(
                            log.timestamp
                          ).toLocaleString()
                          : "—"}
                      </span>

                      <span>
                        {log.election_id || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">
                  No audit records found.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* AI CHAT */}
      <div className="chatbot">
        {chatOpen && (
          <div className="chat">
            <div className="chat-head">
              <b>VoteSphere AI Assistant</b>

              <button
                onClick={() => setChatOpen(false)}
              >
                Ã—
              </button>
            </div>

            <div className="chat-body">
              {messages.map((message, index) => (
                <p
                  key={index}
                  className={message.from}
                >
                  {message.text}
                </p>
              ))}
            </div>

            <div className="chat-input">
              <input
                value={chatInput}
                onChange={(event) =>
                  setChatInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendChat();
                  }
                }}
                placeholder="Ask a question..."
              />

              <button onClick={sendChat}>
                Send
              </button>
            </div>
          </div>
        )}

        <button
          className="chat-btn"
          onClick={() => setChatOpen(!chatOpen)}
        >
          {"\u{1F916}"} AI Help
        </button>
      </div>

      <footer>
        VoteSphere is an educational prototype â€” not for
        public elections.
      </footer>
    </main>
  );
}

export default App;


