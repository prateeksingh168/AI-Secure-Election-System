import { useRef, useState } from "react";
import {
  ArrowRight, BarChart3, Camera, CheckCircle2, LockKeyhole,
  ScanFace, ShieldCheck, Users, Vote
} from "lucide-react";
import "./App.css";

const startingCandidates = [
  { id: 1, name: "Aarav Sharma", party: "Progress Alliance", symbol: "🌱", color: "#17705c", votes: 486 },
  { id: 2, name: "Meera Nair", party: "People First Party", symbol: "☀️", color: "#b56135", votes: 392 },
  { id: 3, name: "Kabir Khan", party: "National Development Front", symbol: "⚙️", color: "#3e62af", votes: 318 },
];

function App() {
  const [screen, setScreen] = useState("login");
  const [role, setRole] = useState("voter");
  const [voterId, setVoterId] = useState("");
  const [chosen, setChosen] = useState(null);
  const [candidates, setCandidates] = useState(startingCandidates);
  const [audit, setAudit] = useState([
    { id: 1, voter: "VTR-1024", time: "10:32 AM", receipt: "VSR-26-81A4" },
    { id: 2, voter: "VTR-1081", time: "10:24 AM", receipt: "VSR-26-79BC" },
  ]);
  const [face, setFace] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [adminTab, setAdminTab] = useState("analytics");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ from: "bot", text: "Hi! Ask me about voting, camera verification, receipts, or analytics." }]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const selected = candidates.find((c) => c.id === chosen);
  const totalVotes = candidates.reduce((a, c) => a + c.votes, 0);
  const totalVoters = 1240;
  const turnout = ((totalVotes / totalVoters) * 100).toFixed(1);

  const login = () => setScreen(role === "admin" ? "admin" : "election");

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch {
      setCameraError("Camera permission allow karo, phir Start Camera dobara click karo.");
    }
  };

  const captureFace = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video?.srcObject) return setCameraError("Pehle Start Camera click karo.");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setFace(canvas.toDataURL("image/png"));
    video.srcObject.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  };

  const castVote = () => {
    const receipt = `VSR-26-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setCandidates((old) => old.map((c) => c.id === chosen ? { ...c, votes: c.votes + 1 } : c));
    setAudit((old) => [{
      id: Date.now(),
      voter: voterId || "VTR-PR-2048",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      receipt,
    }, ...old]);
    setScreen("success");
  };

 const sendChat = () => {
  if (!chatInput.trim()) return;

  const q = chatInput.toLowerCase();

  let reply =
    "I can help with voting criteria, voting steps, camera verification, receipts, and admin analytics.";

  if (
    q.includes("criteria") ||
    q.includes("eligibility") ||
    q.includes("eligible") ||
    q.includes("age") ||
    q.includes("18")
  ) {
    reply =
      "Demo voting eligibility criteria: (1) Voter age must be 18 years or above, (2) voter must be registered, (3) voter account must be active and verified, (4) election must be active, (5) face verification must be completed, and (6) the voter must not have already voted in the same election. Final eligibility is always validated by the backend.";
  } else if (
    q.includes("how to vote") ||
    q.includes("procedure") ||
    q.includes("process")
  ) {
    reply =
      "Voting procedure: Login as Voter → Select Election → Select one Candidate → Complete Face Capture → Review your selection → Cast Final Vote → Save the Receipt ID.";
  } else if (
    q.includes("camera") ||
    q.includes("face") ||
    q.includes("verification")
  ) {
    reply =
      "Click Start Camera, allow camera permission in the browser, then click Capture Face. This frontend uses the image only for the current demo session.";
  } else if (
    q.includes("receipt") ||
    q.includes("confirmation")
  ) {
    reply =
      "After casting the vote, you receive a receipt ID. It confirms that you participated, but it does not reveal your selected candidate.";
  } else if (
    q.includes("candidate") ||
    q.includes("who should") ||
    q.includes("recommend")
  ) {
    reply =
      "Please review candidates independently. The AI assistant provides process information only and does not recommend candidates.";
  } else if (
    q.includes("duplicate") ||
    q.includes("again") ||
    q.includes("twice")
  ) {
    reply =
      "A voter may cast only one vote in the same election. The backend and database should prevent duplicate voting using the voter ID and election ID.";
  } else if (
    q.includes("admin") ||
    q.includes("analytics") ||
    q.includes("database")
  ) {
    reply =
      "The Admin Portal shows aggregate vote counts, turnout, and voter participation records. Candidate choices must remain private to protect ballot secrecy.";
  }

  setMessages((oldMessages) => [
    ...oldMessages,
    { from: "user", text: chatInput },
    { from: "bot", text: reply },
  ]);

  setChatInput("");
};

  const Header = () => (
    <header className="topbar">
      <div className="brand"><div className="logo"><Vote /></div><div><b>VoteSphere</b><small>Secure Digital Elections</small></div></div>
      <div className="secure"><LockKeyhole size={15} /> Secure Demo Session</div>
    </header>
  );

  return (
    <main>
      {screen !== "login" && <Header />}

      {screen === "login" && (
        <section className="login-page">
          <div className="hero">
            <div className="brand"><div className="logo gold"><Vote /></div><div><b>VoteSphere</b><small>Secure Digital Elections</small></div></div>
            <div className="hero-text">
              <span className="badge">🛡️ EDUCATIONAL PROTOTYPE</span>
              <h1>Vote with confidence.<i> Every voice matters.</i></h1>
              <p>Secure, accessible and intelligent election experience.</p>
            </div>
          </div>

          <div className="login-side"><div className="card">
            <span className="eyebrow">SECURE ACCESS</span>
            <h2>Choose your portal</h2>
            <p className="muted">Select your role before signing in.</p>

            <div className="roles">
              <button className={role === "voter" ? "selected" : ""} onClick={() => setRole("voter")}><Vote /><b>Voter</b><small>Cast your vote</small></button>
              <button className={role === "admin" ? "selected" : ""} onClick={() => setRole("admin")}><BarChart3 /><b>Admin</b><small>View analytics</small></button>
            </div>

            <label>{role === "admin" ? "Admin ID / Email" : "Voter ID / Email"}</label>
            <input value={voterId} onChange={(e) => setVoterId(e.target.value)} placeholder={role === "admin" ? "Enter admin ID" : "Enter voter ID"} />
            <label>Password</label><input type="password" placeholder="Enter password" />

            <button className="primary full" onClick={login}>Continue as {role === "admin" ? "Admin" : "Voter"} <ArrowRight size={18} /></button>
            <p className="note">Frontend demo: any login details work.</p>
          </div></div>
        </section>
      )}

      {screen === "election" && <section className="page">
        <span className="eyebrow">VOTER DASHBOARD</span><h1>Hello, Priya! 👋</h1><p className="muted">You are verified and eligible to vote.</p>
        <div className="election-card"><div className="iconbox"><Vote /></div><div><span className="live">LIVE</span><h2>Student Council General Election 2026</h2><p>Choose one representative for the Student Council.</p><small>1,240 eligible voters · Ends at 6:00 PM</small></div><button className="primary" onClick={() => setScreen("candidates")}>Select Election <ArrowRight size={18} /></button></div>
      </section>}

      {screen === "candidates" && <section className="page">
        <span className="eyebrow">STEP 1 OF 4</span><h1>Select your candidate</h1><p className="muted">Choose one candidate, then continue.</p>
        <div className="candidate-grid">{candidates.map((c) => <button key={c.id} className={`candidate ${chosen === c.id ? "chosen" : ""}`} onClick={() => setChosen(c.id)}>
          {chosen === c.id && <CheckCircle2 className="tick" />}<div className="avatar" style={{ background: c.color }}>{c.name.split(" ").map(x => x[0]).join("")}</div><span className="symbol">{c.symbol}</span><h2>{c.name}</h2><p>{c.party}</p>
        </button>)}</div>
        <div className="actions"><button className="secondary" onClick={() => setScreen("election")}>Back</button><button className="primary" disabled={!chosen} onClick={() => setScreen("face")}>Continue <ArrowRight size={18} /></button></div>
      </section>}

      {screen === "face" && <section className="page center"><div className="card face-card">
        <span className="eyebrow">STEP 2 OF 4 — FACE ENROLLMENT</span><h1>Capture your face</h1><p className="muted">Allow camera permission and capture a demo photo.</p>
        {!face ? <><video ref={videoRef} className="camera" autoPlay playsInline /><canvas ref={canvasRef} className="hidden" />{cameraError && <p className="error">{cameraError}</p>}<div className="camera-actions"><button className="secondary" onClick={startCamera}><Camera size={18} /> Start Camera</button><button className="primary" onClick={captureFace}><ScanFace size={18} /> Capture Face</button></div></> :
        <><img className="camera" src={face} alt="Face capture" /><p className="privacy"><ShieldCheck size={18} /> Image stays only in this frontend demo session.</p><button className="primary" onClick={() => setScreen("confirm")}>Continue <ArrowRight size={18} /></button></>}
      </div></section>}

      {screen === "confirm" && selected && <section className="page center"><div className="card face-card">
        <span className="eyebrow">STEP 3 OF 4 — FINAL REVIEW</span><h1>Confirm your vote</h1>
        <div className="selected-candidate"><div className="avatar" style={{ background: selected.color }}>{selected.name.split(" ").map(x => x[0]).join("")}</div><div><small>SELECTED CANDIDATE</small><h2>{selected.name}</h2><p>{selected.party}</p></div><span className="symbol">{selected.symbol}</span></div>
        <p className="checks">✓ Voter eligible &nbsp; ✓ Face verified &nbsp; ✓ Duplicate check complete</p>
        <button className="danger" onClick={castVote}>Cast Final Vote <Vote size={18} /></button>
      </div></section>}

      {screen === "success" && <section className="page center"><div className="card face-card">
        <div className="success"><CheckCircle2 size={65} /></div><span className="eyebrow">VOTE CONFIRMATION</span><h1>Your vote has been recorded</h1><p className="muted">Aggregate analytics have been updated.</p><div className="receipt"><small>RECEIPT ID</small><b>VSR-2026-8A91F3</b></div><button className="primary" onClick={() => setScreen("login")}>Return to Login</button>
      </div></section>}

      {screen === "admin" && <section className="page">
        <div className="admin-head"><div><span className="eyebrow">ADMIN PORTAL</span><h1>Election Management</h1><p className="muted">Monitor participation and vote analytics.</p></div><button className="secondary" onClick={() => setScreen("login")}>Logout</button></div>
        <div className="tabs"><button className={adminTab === "analytics" ? "active" : ""} onClick={() => setAdminTab("analytics")}><BarChart3 size={17} /> Analytics</button><button className={adminTab === "database" ? "active" : ""} onClick={() => setAdminTab("database")}><Users size={17} /> Voter Database</button></div>

        {adminTab === "analytics" && <><div className="metrics"><div><small>Total votes cast</small><b>{totalVotes}</b><span>Live demo count</span></div><div><small>Eligible voters</small><b>{totalVoters}</b><span>Registered voters</span></div><div><small>Voter turnout</small><b>{turnout}%</b><span>Participation rate</span></div></div>
        <div className="panel"><h2>Candidate-wise vote distribution</h2>{candidates.map(c => {const pct = ((c.votes / totalVotes) * 100).toFixed(1); return <div className="chart" key={c.id}><div><span>{c.symbol} {c.name}</span><b>{c.votes} votes ({pct}%)</b></div><div className="track"><i style={{ width: `${pct}%`, background: c.color }} /></div></div>})}</div></>}

        {adminTab === "database" && <div className="panel"><h2>Voter Database</h2><p className="muted">Participation details only. Candidate choices are kept secret.</p>
          <div className="summary"><span>✓ Voted: {audit.length}</span><span>👥 Pending: {totalVoters - audit.length}</span><span>🛡️ Verification completed</span></div>
          <div className="table"><div className="table-row head"><span>Voter ID</span><span>Status</span><span>Verification</span><span>Date & Time</span><span>Receipt ID</span></div>{audit.map(log => <div className="table-row" key={log.id}><span>{log.voter}</span><span className="green">✓ Voted</span><span className="green">🛡️ Face verified</span><span>28 Aug 2026, {log.time}</span><span>{log.receipt}</span></div>)}</div>
        </div>}
      </section>}

      <div className="chatbot">{chatOpen && <div className="chat"><div className="chat-head"><b>VoteSphere AI Assistant</b><button onClick={() => setChatOpen(false)}>×</button></div><div className="chat-body">{messages.map((m, i) => <p key={i} className={m.from}>{m.text}</p>)}</div><div className="chat-input"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Ask a question..." /><button onClick={sendChat}>Send</button></div></div>}<button className="chat-btn" onClick={() => setChatOpen(!chatOpen)}>🤖 AI Help</button></div>
      <footer>VoteSphere is an educational frontend prototype — not for public elections.</footer>
    </main>
  );
}

export default App;