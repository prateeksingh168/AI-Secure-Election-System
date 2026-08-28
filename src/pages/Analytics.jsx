import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../api/axios";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch live election aggregated results
    api.get("/elections/E001/results")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Results query failed, fallback used:", err);
        setError("Error loading live results. Displaying static baseline statistics.");
        setData({
          total_eligible_voters: 100,
          total_votes_cast: 30,
          turnout_percentage: 30.0,
          candidate_results: [
            { name: "Aditi Sharma", vote_count: 15 },
            { name: "Rahul Verma", vote_count: 10 },
            { name: "Priya Singh", vote_count: 5 }
          ]
        });
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

  const notVoted = (data?.total_eligible_voters || 0) - (data?.total_votes_cast || 0);
  const opts = { 
    plugins: { legend: { labels: { color: "#cbd5e1" } } }, 
    scales: { 
      x: { ticks: { color: "#64748b" }, grid: { color: "rgba(148, 163, 184, 0.05)" } }, 
      y: { ticks: { color: "#64748b" }, grid: { color: "rgba(148, 163, 184, 0.05)" } } 
    } 
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span>📊</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Election Analytics
          </span>
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">Live Audit Metrics</p>
      </div>

      {error && (
        <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400 text-xs p-3.5 rounded-xl text-center">
          ℹ️ {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Total Eligible", data?.total_eligible_voters], 
          ["Votes Recorded", data?.total_votes_cast], 
          ["Turnout Rate", `${data?.turnout_percentage}%`]
        ].map(([label, val]) => (
          <div key={label} className="glass-panel p-6 rounded-2xl text-center space-y-1">
            <p className="text-3xl font-black text-blue-400 text-glow-blue">{val}</p>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="font-bold mb-4 text-white text-base">Candidate-wise Votes</h2>
          <Bar 
            data={{ 
              labels: data?.candidate_results.map((c) => c.name), 
              datasets: [{ 
                label: "Votes Count", 
                data: data?.candidate_results.map((c) => c.vote_count), 
                backgroundColor: "#3b82f6",
                borderRadius: 8
              }] 
            }} 
            options={opts} 
          />
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="font-bold mb-4 text-white text-base">Voter Turnout Rate</h2>
          <Doughnut 
            data={{ 
              labels: ["Voted", "Not Voted"], 
              datasets: [{ 
                data: [data?.total_votes_cast, notVoted], 
                backgroundColor: ["#22c55e", "#334155"],
                borderWidth: 0
              }] 
            }} 
            options={{ 
              plugins: { legend: { labels: { color: "#cbd5e1" } } } 
            }} 
          />
        </div>
      </div>
    </div>
  );
}