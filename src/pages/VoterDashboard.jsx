import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function VoterDashboard() {
  const [eligibility, setEligibility] = useState(null);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch voter eligibility for the main election (E001)
        const eligibilityRes = await api.get("/voters/me/eligibility?election_id=E001");
        setEligibility(eligibilityRes.data);

        // Fetch elections list
        const electionsRes = await api.get("/elections");
        setElections(electionsRes.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Error loading data from server. Playing with fallback data.");
        setEligibility({
          eligible: true,
          verification_status: "VERIFIED",
          has_voted: false
        });
        setElections([{
          election_id: "E001",
          title: "Student Council Election 2026",
          status: "active",
          start_date: "2026-08-01",
          end_date: "2026-08-30"
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const Badge = ({ ok, label }) => (
    <span className={`px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 border ${
      ok 
        ? "bg-green-950/20 text-green-400 border-green-800/30 shadow-glow-emerald/5" 
        : "bg-red-950/20 text-red-400 border-red-800/30"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
      {label}
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-12 px-4 cyber-dots">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Welcome Banner */}
        <div className="glass-panel-premium p-8 rounded-3xl border border-white/5 relative overflow-hidden flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user.name || "Voter"} 👋
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Secure Voter Dashboard</p>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-[11px] font-semibold text-blue-400">
            Role: <span className="text-white font-bold">{user.role || "VOTER"}</span>
          </div>
        </div>

        {error && (
          <div className="bg-blue-900/10 border border-blue-500/20 text-blue-400 text-xs p-4 rounded-2xl font-medium">
            ℹ️ {error}
          </div>
        )}

        {/* Verification Status Badges */}
        <div className="glass-panel-premium p-6 rounded-3xl flex flex-wrap gap-3 border border-white/5">
          <Badge ok={eligibility?.verification_status === "VERIFIED"} label={`Verification: ${eligibility?.verification_status || "PENDING"}`} />
          <Badge ok={eligibility?.eligible} label={eligibility?.eligible ? "System Status: Eligible" : "System Status: Ineligible"} />
          <Badge ok={!eligibility?.has_voted} label={eligibility?.has_voted ? "Record: Voted" : "Record: No ballot submitted"} />
        </div>
        
        {/* Elections Section */}
        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-white tracking-wide">Available Elections</h2>
          {elections.length === 0 ? (
            <p className="text-slate-500 text-sm">No scheduled elections are available currently.</p>
          ) : (
            elections.map((election) => (
              <div key={election.election_id} className="glass-panel-premium p-8 rounded-3xl space-y-6 border border-white/5 hover:border-blue-500/20 transition-all duration-300">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xl text-white tracking-tight">{election.title}</h3>
                    <p className="text-slate-500 text-xs font-semibold">Duration: {election.start_date} to {election.end_date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider ${
                    election.status?.toLowerCase() === "active" 
                      ? "bg-green-950/30 text-green-400 border border-green-800/40" 
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}>
                    {election.status}
                  </span>
                </div>

                <div className="flex gap-3 flex-wrap pt-2">
                  <Link 
                    to="/candidates" 
                    className="bg-slate-950/60 hover:bg-slate-900 border border-slate-800 px-6 py-3 rounded-xl text-xs font-bold text-white transition duration-300"
                  >
                    View Candidates
                  </Link>
                  <Link 
                    to="/ai-chat" 
                    className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 px-6 py-3 rounded-xl text-xs font-bold text-purple-400 transition duration-300"
                  >
                    🤖 AI Election Advisor
                  </Link>
                  {election.status?.toLowerCase() === "active" && eligibility?.eligible && !eligibility?.has_voted ? (
                    <Link 
                      to="/vote" 
                      className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-xs font-extrabold text-white transition shadow-lg shadow-blue-500/25 duration-300 transform hover:-translate-y-0.5"
                    >
                      Cast Vote →
                    </Link>
                  ) : (
                    <span className="bg-slate-950 text-slate-600 border border-slate-900/60 px-6 py-3 rounded-xl text-xs font-bold cursor-not-allowed">
                      {eligibility?.has_voted ? "Vote Recorded" : "Voting Unavailable"}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}