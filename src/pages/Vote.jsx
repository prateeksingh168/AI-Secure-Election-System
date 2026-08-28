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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-12 px-4 cyber-dots">
      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        
        {/* Progress Steps Header */}
        <div className="glass-panel-premium p-6 rounded-3xl border border-white/5 shadow-lg flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {STEPS.map((title, index) => (
            <div
              key={title}
              className="flex items-center gap-3.5 whitespace-nowrap shrink-0"
            >
              <span
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-500 border ${
                  index <= step
                    ? "bg-blue-600 border-blue-500 text-white shadow-glow-blue/20"
                    : "bg-slate-950 border-slate-900 text-slate-500"
                }`}
              >
                {index + 1}
              </span>

              <span
                className={`text-xs font-bold uppercase tracking-wider transition-colors duration-500 ${
                  index <= step ? "text-white" : "text-slate-500"
                }`}
              >
                {title}
              </span>

              {index < STEPS.length - 1 && (
                <span className="text-slate-800 font-bold mx-2">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Error Warning */}
        {error && (
          <div className="bg-red-950/20 border border-red-800/40 text-red-400 p-5 rounded-2xl">
            <p className="font-bold text-xs uppercase tracking-widest">Validation Block Alert</p>
            <p className="text-[11px] mt-1 leading-relaxed font-semibold">{error}</p>
          </div>
        )}

        {/* STEP 1: Select Candidate */}
        {step === 0 && (
          <div className="glass-panel-premium p-8 rounded-3xl space-y-6 border border-white/5 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Select Candidate</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Step 1 of 4: Roster Selection</p>
            </div>

            <div className="grid gap-3">
              {candidates.map((candidate) => (
                <label
                  key={candidate.candidate_id}
                  className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selected?.candidate_id === candidate.candidate_id
                      ? "border-blue-500/35 bg-blue-500/5 shadow-glow-blue/5"
                      : "border-slate-900 bg-slate-950/40 hover:border-slate-800"
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
                    className="accent-blue-500 w-4 h-4 cursor-pointer"
                  />

                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl shrink-0">
                    {candidate.symbol || "👤"}
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-extrabold text-white text-base leading-tight">
                      {candidate.name}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                      Dept: {candidate.department}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <button
                disabled={!selected}
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5 duration-300 text-sm shadow-lg shadow-blue-500/10"
              >
                Proceed to Biometric Enrollment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Face Enrollment */}
        {step === 1 && (
          <div className="glass-panel-premium p-8 rounded-3xl space-y-6 border border-white/5 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Biometric Enrollment</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Step 2 of 4: Profile Registration</p>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Frame your face clearly in the camera window. We extract secure cryptographic vectors to create your biometric key template. No raw images are uploaded.
            </p>

            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-900 flex justify-center">
              <FaceEnroll
                voterId={localStorage.getItem("voter_id") || "V001"}
                onEnrolled={() => {
                  setError("");
                  setStep(2);
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Face Verification */}
        {step === 2 && (
          <div className="glass-panel-premium p-8 rounded-3xl space-y-6 border border-white/5 shadow-2xl">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Biometric Verification</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Step 3 of 4: Identity Validation</p>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              Verify biometric signature matching. This checks your live face against the enrolled template vector before granting access to submit your anonymous ballot.
            </p>

            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-900 flex justify-center">
              <FaceVerify
                voterId={localStorage.getItem("voter_id") || "V001"}
                onVerified={() => {
                  setError("");
                  setStep(3);
                }}
              />
            </div>
          </div>
        )}

        {/* STEP 4: Confirm Vote */}
        {step === 3 && (
          <div className="glass-panel-premium p-8 rounded-3xl text-center space-y-6 border border-white/5 shadow-2xl">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center justify-center text-4xl mx-auto animate-bounce shadow-glow-emerald">
              ✓
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Review Ballot Submission</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Step 4 of 4: Final Ballot cast</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-900 p-6 rounded-2xl space-y-1 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Selected Candidate</span>
              <span className="text-white font-extrabold text-xl block mt-1">
                {selected?.name} ({selected?.symbol})
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mt-2">Department: {selected?.department}</span>
            </div>

            <div className="flex gap-4 justify-center pt-2 flex-wrap">
              <button
                onClick={() => {
                  setError("");
                  setStep(0);
                }}
                disabled={submitting}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-900 px-6 py-3.5 rounded-xl text-slate-300 font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 duration-300"
              >
                Change Candidate
              </button>

              <button
                onClick={castVote}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-xl font-extrabold text-white text-xs uppercase tracking-wider shadow-lg shadow-blue-500/15 transition disabled:opacity-50 duration-300 transform hover:-translate-y-0.5"
              >
                {submitting ? "Signing Ballot..." : "Submit Anonymous Ballot"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}