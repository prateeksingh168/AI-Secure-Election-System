import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { mockAnalytics } from "../data/mockData";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Analytics() {
  const data = mockAnalytics; // Direct mock data use kar rahe hain
  const notVoted = data.total_voters - data.votes_cast;
  
  const opts = { plugins: { legend: { labels: { color: "#d1d5db" } } }, scales: { x: { ticks: { color: "#9ca3af" } }, y: { ticks: { color: "#9ca3af" } } } };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">📊 Election Analytics</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[["Total Voters", data.total_voters], ["Votes Cast", data.votes_cast], ["Turnout", `${data.turnout_percentage}%`]].map(([label, val]) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center"><p className="text-3xl font-bold text-blue-400">{val}</p><p className="text-gray-400 text-sm mt-1">{label}</p></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-white">Candidate-wise Votes</h2>
          <Bar data={{ labels: data.candidate_results.map((c) => c.name), datasets: [{ label: "Votes", data: data.candidate_results.map((c) => c.votes), backgroundColor: "#3b82f6" }] }} options={opts} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold mb-4 text-white">Voter Turnout</h2>
          <Doughnut data={{ labels: ["Voted", "Not Voted"], datasets: [{ data: [data.votes_cast, notVoted], backgroundColor: ["#22c55e", "#374151"] }] }} options={{ plugins: { legend: { labels: { color: "#d1d5db" } } } }} />
        </div>
      </div>
    </div>
  );
}