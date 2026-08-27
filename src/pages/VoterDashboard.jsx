import { Link } from "react-router-dom";
import { mockElection } from "../data/mockData";

export default function VoterDashboard() {
  // Humne API hata di hai, ab ye direct mock data use karega
  const voter = JSON.parse(localStorage.getItem("user") || "{}");
  const election = mockElection;
  
  const canVote = true; // Demo mode me hamesha true

  const Badge = ({ ok, label }) => (<span className={`px-3 py-1 rounded-full text-sm ${ok ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>{ok ? "✅" : "❌"} {label}</span>);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {voter.name || "User"} 👋</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex flex-wrap gap-3">
        <Badge ok={true} label="Verified" />
        <Badge ok={true} label="Eligible" />
        <Badge ok={true} label="Not Voted Yet" />
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-2">️ {election.title}</h2>
        <p className="text-gray-400 text-sm">Status: <b className="text-white">{election.status}</b></p>
        <p className="text-gray-400 text-sm">{election.start_date} to {election.end_date}</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Link to="/candidates" className="bg-gray-800 hover:bg-gray-700 px-5 py-2 rounded-lg text-white">View Candidates</Link>
        <Link to="/ai-chat" className="bg-purple-700 hover:bg-purple-600 px-5 py-2 rounded-lg text-white">🤖 AI Assistant</Link>
        {canVote ? (
          <Link to="/vote" className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold text-white">Vote Now →</Link>
        ) : (
          <span className="bg-gray-800 text-gray-500 px-5 py-2 rounded-lg">Already Voted</span>
        )}
      </div>
    </div>
  );
}