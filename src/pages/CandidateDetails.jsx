import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function CandidateDetails() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  useEffect(() => { api.get(`/candidates/${id}`).then((r) => setC(r.data)); }, [id]);
  if (!c) return <p className="p-8 text-gray-400">Loading...</p>;
  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link to="/candidates" className="text-blue-400 text-sm">← Back to candidates</Link>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mt-4">
        <div className="flex items-center gap-5 mb-6">
          <img src={c.photo_url} alt={c.name} className="w-24 h-24 rounded-full object-cover bg-gray-800" />
          <div><h1 className="text-2xl font-bold">{c.name}</h1><p className="text-gray-400">{c.party}</p></div>
        </div>
        <h2 className="font-semibold mb-2">📜 Manifesto</h2>
        <p className="text-gray-300 whitespace-pre-line">{c.manifesto}</p>
      </div>
    </div>
  );
}