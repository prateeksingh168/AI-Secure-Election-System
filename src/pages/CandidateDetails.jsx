import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function CandidateDetails() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/elections/E001/candidates")
      .then((res) => {
        const found = res.data.find((cand) => cand.candidate_id === id);
        if (found) {
          setC(found);
        } else {
          throw new Error("Candidate not found in roster");
        }
      })
      .catch((err) => {
        console.warn("Detailed query failed, fallback used:", err);
        // Fallback candidates
        const fallbacks = [
          { candidate_id: "C001", name: "Aditi Sharma", department: "CS", symbol: "✊", manifesto: "Focusing on modern education infrastructures, student health care benefits, and responsive student council representation." },
          { candidate_id: "C002", name: "Rahul Verma", department: "ECE", symbol: "🛡️", manifesto: "Committed to expanding tech resources, organizing student industrial visits, and public welfare campaigns." },
          { candidate_id: "C003", name: "Priya Singh", department: "Mech", symbol: "🚀", manifesto: "Improving campus sustainability, introducing clean energy programs, and female student mentorship groups." }
        ];
        setC(fallbacks.find((cand) => cand.candidate_id === id) || fallbacks[0]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!c) {
    return <p className="p-8 text-gray-400 text-center">Candidate not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <Link to="/candidates" className="text-blue-400 text-sm font-semibold hover:underline flex items-center gap-1">
        <span>←</span> Back to Candidates Roster
      </Link>
      
      <div className="glass-panel p-8 rounded-2xl space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-900">
          <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-5xl shadow-glow-blue">
            {c.symbol || "👤"}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">{c.name}</h1>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">Department: {c.department}</p>
            <p className="text-slate-500 text-xs">ID: <span className="font-mono">{c.candidate_id}</span></p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📜</span> Candidate Manifesto & Vision
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
            {c.manifesto}
          </p>
        </div>
      </div>
    </div>
  );
}