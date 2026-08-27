import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockCandidates } from "../data/mockData";
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
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

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
      console.log("Candidate ID:", selected.id);
      console.log("Biometric token exists:", !!biometricToken);
      console.log("Auth token exists:", !!token);

      const response = await fetch(
        "http://127.0.0.1:8000/elections/E001/vote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            candidate_id: String(selected.id),
            biometric_token: biometricToken,
          }),
        }
      );

      const data = await response.json();

      console.log("VOTE RESPONSE:", data);

      if (!response.ok) {
        let message = "Vote casting failed.";

        if (Array.isArray(data?.detail)) {
          message = data.detail
            .map((item) => {
              if (typeof item === "string") {
                return item;
              }

              if (item?.msg) {
                return item.msg;
              }

              return "Validation error";
            })
            .join(", ");
        } else if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (data?.detail) {
          message = JSON.stringify(data.detail);
        } else if (typeof data?.message === "string") {
          message = data.message;
        }

        throw new Error(message);
      }

      // Successful vote
      navigate("/vote-confirmation", {
        state: {
          vote_id: data.vote_id,
          timestamp: data.cast_at,
        },
      });
    } catch (err) {
      console.error("Vote submission error:", err);

      const safeMessage =
        typeof err?.message === "string"
          ? err.message
          : "Vote casting failed. Please try again.";

      setError(safeMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((title, index) => (
          <div
            key={title}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index <= step
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-500"
                }`}
            >
              {index + 1}
            </span>

            <span
              className={`text-sm ${index <= step ? "text-white" : "text-gray-500"
                }`}
            >
              {title}
            </span>

            {index < STEPS.length - 1 && (
              <span className="text-gray-700 mx-2">---</span>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 p-4 rounded-xl mb-6">
          <p className="font-semibold mb-1">Vote Error</p>
          <p className="text-sm break-words">{error}</p>
        </div>
      )}

      {/* STEP 1: Select Candidate */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">
            Select Your Candidate
          </h2>

          <div className="space-y-3">
            {mockCandidates.map((candidate) => (
              <label
                key={candidate.id}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${selected?.id === candidate.id
                  ? "border-blue-500 bg-blue-900/20"
                  : "border-gray-800 bg-gray-900 hover:border-gray-700"
                  }`}
              >
                <input
                  type="radio"
                  name="candidate"
                  checked={selected?.id === candidate.id}
                  onChange={() => {
                    setSelected(candidate);
                    setError("");
                  }}
                />

                <img
                  src={candidate.photo_url}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-800"
                />

                <div>
                  <p className="font-semibold text-white">
                    {candidate.name}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {candidate.party}
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
            className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed text-white"
          >
            Next: Face Enrollment →
          </button>
        </div>
      )}

      {/* STEP 2: Face Enrollment */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">
            Face Enrollment
          </h2>

          <p className="text-gray-400 text-sm mb-4">
            Allow camera access and register your face.
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
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">
            Face Verification
          </h2>

          <p className="text-gray-400 text-sm mb-4">
            Your identity is being verified.
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-white">
            Confirm Your Vote
          </h2>

          <p className="text-green-400 mb-3">
            ✓ Face successfully verified
          </p>

          <p className="text-gray-300 mb-6">
            You are voting for:{" "}
            <b className="text-white text-lg">
              {selected?.name}
            </b>
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setError("");
                setStep(0);
              }}
              disabled={submitting}
              className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg text-white disabled:opacity-50"
            >
              ← Change Candidate
            </button>

            <button
              onClick={castVote}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Casting Vote..." : "Cast Final Vote"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}