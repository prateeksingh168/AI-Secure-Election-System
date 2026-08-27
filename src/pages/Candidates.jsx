import { Link } from "react-router-dom";
import { mockCandidates } from "../data/mockData";

export default function Candidates() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🧑‍💼 Candidates</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {mockCandidates.map((c) => (
          <Link key={c.id} to={`/candidates/${c.id}`} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition block">
            <img src={c.photo_url} alt={c.name} className="w-20 h-20 rounded-full object-cover mb-4 bg-gray-800 mx-auto" />
            <h2 className="font-semibold text-lg text-center text-white">{c.name}</h2>
            <p className="text-gray-400 text-sm text-center">{c.party}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}