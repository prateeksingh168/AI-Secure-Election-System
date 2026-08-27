import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockCandidates } from "../data/mockData";
import FaceEnroll from "../components/FaceEnroll";
import FaceVerify from "../components/FaceVerify";

const STEPS = ["Select Candidate", "Enroll Face", "Verify Face", "Confirm Vote"];

export default function Vote() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const castVote = () => {
    setSubmitting(true);
    // Fake vote submission delay
    setTimeout(() => {
      navigate("/vote-confirmation", { state: { vote_id: "VOTE-" + Math.floor(Math.random() * 10000), timestamp: new Date() } });
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 whitespace-nowrap">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "bg-blue-600" : "bg-gray-800 text-gray-500"}`}>{i + 1}</span>
            <span className={`text-sm ${i <= step ? "text-white" : "text-gray-500"}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="text-gray-700 mx-2">——</span>}
          </div>
        ))}
      </div>
      {error && <p className="bg-red-900/40 border border-red-700 text-red-300 p-4 rounded-xl mb-6">{error}</p>}

      {/* STEP 1: Select Candidate */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Apna candidate select karo</h2>
          <div className="space-y-3">
            {mockCandidates.map((c) => (
              <label key={c.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer ${selected?.id === c.id ? "border-blue-500 bg-blue-900/20" : "border-gray-800 bg-gray-900"}`}>
                <input type="radio" name="candidate" checked={selected?.id === c.id} onChange={() => setSelected(c)} />
                <img src={c.photo_url} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-800" />
                <div><p className="font-semibold text-white">{c.name}</p><p className="text-gray-400 text-sm">{c.party}</p></div>
              </label>
            ))}
          </div>
          <button disabled={!selected} onClick={() => setStep(1)} className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold disabled:opacity-40 text-white">Next: Face Enrollment →</button>
        </div>
      )}

      {/* STEP 2: REAL Face Enrollment */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white"> Face Enrollment</h2>
          <p className="text-gray-400 text-sm mb-4">Camera allow karo aur apna face register karo.</p>
          <FaceEnroll voterId={99} onEnrolled={() => setStep(2)} />
        </div>
      )}

      {/* STEP 3: REAL Face Verification */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">🔍 Face Verification</h2>
          <p className="text-gray-400 text-sm mb-4">Ab verify kiya ja raha hai ki aap hi voter hain.</p>
          <FaceVerify voterId={99} onVerified={() => setStep(3)} />
        </div>
      )}

      {/* STEP 4: Confirm Vote */}
      {step === 3 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-white">Vote Confirm Karo</h2>
          <p className="text-green-400 mb-2">✅ Face successfully verified</p>
          <p className="text-gray-300 mb-6">Aap vote de rahe hain: <b className="text-white text-lg">{selected?.name}</b></p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setStep(0)} className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg text-white">← Change</button>
            <button onClick={castVote} disabled={submitting} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50">
              {submitting ? "Casting Vote..." : "️ Cast Final Vote"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}