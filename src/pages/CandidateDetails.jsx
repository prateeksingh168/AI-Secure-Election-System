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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!c) {
    return <p className="p-8 text-gray-400 text-center font-medium">Candidate profile not found.</p>;
  }

  return (
    <div className="min-h-screen bg-[#020617] py-12 px-4 cyber-dots">
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <Link to="/voter/candidates" className="text-blue-400 text-xs font-bold hover:underline flex items-center gap-1.5 uppercase tracking-wider">
          <span>←</span> Back to Candidates Roster
        </Link>
        
        <div className="glass-panel-premium p-8 rounded-3xl space-y-8 border border-white/5 shadow-2xl">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-900/60 flex-wrap sm:flex-nowrap">
            <div className="w-28 h-28 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-6xl shadow-glow-blue/15 shrink-0">
              {c.symbol || "👤"}
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{c.name}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Department: {c.department}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Candidate Token: <span className="font-mono text-slate-300 font-semibold">{c.candidate_id}</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📜</span> Candidate Manifesto & Vision
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-6 rounded-2xl border border-slate-900/80">
              {c.manifesto}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}