import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/elections/E001/candidates")
      .then((res) => {
        setCandidates(res.data);
      })
      .catch((err) => {
        console.error("Candidates query failed, fallback mock candidates used:", err);
        setError("Database candidates empty. Using preset configurations.");
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

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-12 px-4 cyber-dots">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>🧑‍💼</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Registered Candidates
            </span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Active Election Roster</p>
        </div>

        {error && (
          <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400 text-xs p-3.5 rounded-xl text-center font-medium">
            ℹ️ {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <Link 
              key={c.candidate_id} 
              to={`/candidates/${c.candidate_id}`} 
              className="glass-card-premium p-6 rounded-3xl flex flex-col items-center text-center space-y-5 border border-white/5 group duration-300"
            >
              <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-5xl shadow-inner group-hover:scale-105 transition-all duration-300 group-hover:shadow-glow-blue/20">
                {c.symbol || "👤"}
              </div>
              <div className="space-y-1.5">
                <h2 className="font-extrabold text-xl text-white group-hover:text-blue-400 transition-colors duration-300">{c.name}</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dept: {c.department}</p>
              </div>
              <span className="text-blue-400 text-xs font-bold bg-blue-500/5 border border-blue-500/10 px-4 py-2 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                View Manifesto & Vision →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}