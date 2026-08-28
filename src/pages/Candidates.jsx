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
        // Fallback mock candidates
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span>🧑‍💼</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Registered Candidates
          </span>
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">Active Election Roster</p>
      </div>

      {error && (
        <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400 text-xs p-3.5 rounded-xl text-center">
          ℹ️ {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((c) => (
          <Link 
            key={c.candidate_id} 
            to={`/candidates/${c.candidate_id}`} 
            className="glass-card p-6 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-0.5 transform transition"
          >
            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl shadow-inner">
              {c.symbol || "👤"}
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">{c.name}</h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Dept: {c.department}</p>
            </div>
            <span className="text-blue-400 text-xs font-semibold hover:underline">View Manifesto & Profile →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}