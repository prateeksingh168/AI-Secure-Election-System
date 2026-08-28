import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import FaceEnroll from "../components/FaceEnroll";
import FaceVerify from "../components/FaceVerify";

const STEPS = [
  "Select Candidate",
  "Enroll Face",
  "Verify Face",
  "Confirm Vote",
];

export default function Vote() {
  const [step, setStep] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/elections/E001/candidates")
      .then((res) => {
        setCandidates(res.data);
      })
      .catch((err) => {
        console.error("Failed to load candidates, using fallback list:", err);
        setCandidates([
          { candidate_id: "C001", name: "Aditi Sharma", department: "CS", symbol: "✊", manifesto: "Education and Healthcare focus." },
          { candidate_id: "C002", name: "Rahul Verma", department: "ECE", symbol: "🛡️", manifesto: "Employment and public welfare priority." },
          { candidate_id: "C003", name: "Priya Singh", department: "Mech", symbol: "🚀", manifesto: "Infrastructure and tech development." }
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const castVote = async () => {
    if (!selected) {
      setError("Please select a candidate first.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");
      const biometricToken = localStorage.getItem("biometric_token");

      console.log("Casting vote...");
      console.log("Candidate ID:", selected.candidate_id);

      const response = await fetch(
        "http://127.0.0.1:8000/elections/E001/vote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            candidate_id: String(selected.candidate_id),
            biometric_token: biometricToken,
          }),
        }
      );

      const data = await response.json();
      console.log("VOTE RESPONSE:", data);

      if (!response.ok) {
        let message = "Vote casting failed.";
        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (data?.detail) {
          message = JSON.stringify(data.detail);
        }
        throw new Error(message);
      }

      // Cleanup session biometric tokens
      localStorage.removeItem("biometric_token");

      // Successful vote
      navigate("/vote-confirmation", {
        state: {
          vote_id: data.vote_id,
          timestamp: data.cast_at,
        },
      });
    } catch (err) {
      console.error("Vote submission error:", err);
      setError(err.message || "Vote casting failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-slate-900">
        {STEPS.map((title, index) => (
          <div
            key={title}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${index <= step
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-500"
                }`}
            >
              {index + 1}
            </span>

            <span
              className={`text-sm font-semibold ${index <= step ? "text-white" : "text-slate-500"
                }`}
            >
              {title}
            </span>

            {index < STEPS.length - 1 && (
              <span className="text-slate-800 mx-2">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/30 border border-red-800/40 text-red-400 p-4 rounded-xl">
          <p className="font-bold text-sm">Vote Security Warning</p>
          <p className="text-xs mt-1 leading-relaxed">{error}</p>
        </div>
      )}

      {/* STEP 1: Select Candidate */}
      {step === 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Select Candidate</h2>

          <div className="grid gap-3">
            {candidates.map((candidate) => (
              <label
                key={candidate.candidate_id}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition ${selected?.candidate_id === candidate.candidate_id
                  ? "border-blue-500/40 bg-blue-500/5 shadow-glow-blue"
                  : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
              >
                <input
                  type="radio"
                  name="candidate"
                  checked={selected?.candidate_id === candidate.candidate_id}
                  onChange={() => {
                    setSelected(candidate);
                    setError("");
                  }}
                  className="accent-blue-500"
                />

                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">
                  {candidate.symbol || "👤"}
                </div>

                <div>
                  <p className="font-bold text-white text-base">
                    {candidate.name}
                  </p>

                  <p className="text-slate-400 text-xs mt-0.5">
                    Dept: {candidate.department}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <button
            disabled={!selected}
            onClick={() => {
              setError("");
              setStep(1);
            }}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next: Face Enrollment →
          </button>
        </div>
      )}

      {/* STEP 2: Face Enrollment */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Face Enrollment</h2>
          <p className="text-slate-400 text-sm">
            Please frame your face in the camera view to capture your validation credentials.
          </p>

          <FaceEnroll
            voterId={localStorage.getItem("voter_id") || "V001"}
            onEnrolled={() => {
              setError("");
              setStep(2);
            }}
          />
        </div>
      )}

      {/* STEP 3: Face Verification */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Face Verification</h2>
          <p className="text-slate-400 text-sm">
            Verify biometric signature before final ballot submission.
          </p>

          <FaceVerify
            voterId={localStorage.getItem("voter_id") || "V001"}
            onVerified={() => {
              setError("");
              setStep(3);
            }}
          />
        </div>
      )}

      {/* STEP 4: Confirm Vote */}
      {step === 3 && (
        <div className="glass-panel p-8 rounded-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
            ✓
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Confirm Your Vote</h2>
            <p className="text-slate-400 text-sm">Biometric authentication completed successfully.</p>
          </div>

          <p className="text-slate-300 text-base">
            You are casting your vote for:{" "}
            <span className="text-white font-extrabold text-lg block mt-1">
              {selected?.name} ({selected?.symbol})
            </span>
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={() => {
                setError("");
                setStep(0);
              }}
              disabled={submitting}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-3 rounded-xl text-slate-300 transition disabled:opacity-50"
            >
              Change Candidate
            </button>

            <button
              onClick={castVote}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {submitting ? "Recording Ballot..." : "Submit Final Ballot"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}