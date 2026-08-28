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
        // Fallback mock states if backend is offline
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
    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
      ok 
        ? "bg-green-950/30 text-green-400 border-green-800/40" 
        : "bg-red-950/30 text-red-400 border-red-800/40"
    }`}>
      <span>{ok ? "✓" : "✗"}</span> {label}
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">
          Welcome, {user.name || "Voter"} 👋
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">Voter Control Panel</p>
      </div>

      {error && (
        <div className="bg-blue-900/10 border border-blue-500/20 text-blue-400 text-sm p-4 rounded-xl">
          ℹ️ {error}
        </div>
      )}

      {/* Verification Status Badges */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap gap-3">
        <Badge ok={eligibility?.verification_status === "VERIFIED"} label={`Verification: ${eligibility?.verification_status || "PENDING"}`} />
        <Badge ok={eligibility?.eligible} label={eligibility?.eligible ? "System Eligible" : "System Ineligible"} />
        <Badge ok={!eligibility?.has_voted} label={eligibility?.has_voted ? "Already Voted" : "Not Voted Yet"} />
      </div>
      
      {/* Elections Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Available Elections</h2>
        {elections.length === 0 ? (
          <p className="text-slate-500 text-sm">No scheduled elections are available currently.</p>
        ) : (
          elections.map((election) => (
            <div key={election.election_id} className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg text-white">{election.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">Duration: {election.start_date} to {election.end_date}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  election.status === "active" ? "bg-green-950 text-green-400 border border-green-800" : "bg-slate-900 text-slate-400 border border-slate-800"
                }`}>
                  {election.status}
                </span>
              </div>

              <div className="flex gap-3 flex-wrap pt-2">
                <Link to="/candidates" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition">
                  View Candidates
                </Link>
                <Link to="/ai-chat" className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 px-5 py-2.5 rounded-xl text-sm font-semibold text-purple-400 transition">
                  🤖 AI Election Advisor
                </Link>
                {election.status === "active" && eligibility?.eligible && !eligibility?.has_voted ? (
                  <Link to="/vote" className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-blue-500/10">
                    Cast Vote →
                  </Link>
                ) : (
                  <span className="bg-slate-950 text-slate-600 border border-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed">
                    {eligibility?.has_voted ? "Vote Recorded" : "Voting Unavailable"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}