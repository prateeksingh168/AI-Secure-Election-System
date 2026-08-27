import { useEffect, useState } from "react";
import api from "../api/axios";
export default function AdminDashboard() {
  const [tab, setTab] = useState("elections");
  const [elections, setElections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [cForm, setCForm] = useState({ name: "", party: "", manifesto: "" });
  const [eForm, setEForm] = useState({ title: "", start_date: "", end_date: "" });
  const [msg, setMsg] = useState("");
  const load = () => { api.get("/elections").then((r) => setElections(r.data)); api.get("/audit/logs").then((r) => setLogs(r.data)); };
  useEffect(load, []);
  const setStatus = async (id, status) => { await api.patch(`/elections/${id}/status`, { status }); setMsg(`Election ${status} ho gaya.`); load(); };
  const createElection = async (e) => { e.preventDefault(); await api.post("/elections", eForm); setEForm({ title: "", start_date: "", end_date: "" }); setMsg("Election created."); load(); };
  const addCandidate = async (e) => { e.preventDefault(); await api.post("/candidates", cForm); setCForm({ name: "", party: "", manifesto: "" }); setMsg("Candidate added."); };
  const input = "w-full mb-3 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500 text-sm text-white";
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">‍💼 Admin Dashboard</h1>
      {msg && <p className="text-green-400 text-sm mb-4">✅ {msg}</p>}
      <div className="flex gap-3 mb-6">{["elections", "candidates", "audit"].map((t) => (<button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"} text-white`}>{t === "audit" ? "Audit Logs" : t}</button>))}</div>
      {tab === "elections" && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={createElection} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-4">➕ Create Election</h2>
            <input className={input} placeholder="Title" required value={eForm.title} onChange={(e) => setEForm({ ...eForm, title: e.target.value })} />
            <input className={input} type="date" required value={eForm.start_date} onChange={(e) => setEForm({ ...eForm, start_date: e.target.value })} />
            <input className={input} type="date" required value={eForm.end_date} onChange={(e) => setEForm({ ...eForm, end_date: e.target.value })} />
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm w-full text-white">Create</button>
          </form>
          <div className="space-y-3">{elections.map((el) => (<div key={el.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between"><div><p className="font-semibold">{el.title}</p><p className="text-gray-400 text-sm">Status: {el.status}</p></div><div className="flex gap-2">{el.status !== "active" && <button onClick={() => setStatus(el.id, "active")} className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded-lg text-xs text-white">Activate</button>}{el.status === "active" && <button onClick={() => setStatus(el.id, "closed")} className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded-lg text-xs text-white">Close</button>}</div></div>))}</div>
        </div>
      )}
      {tab === "candidates" && (
        <form onSubmit={addCandidate} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md">
          <h2 className="font-semibold mb-4"> Add Candidate</h2>
          <input className={input} placeholder="Name" required value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} />
          <input className={input} placeholder="Party" required value={cForm.party} onChange={(e) => setCForm({ ...cForm, party: e.target.value })} />
          <textarea className={input} placeholder="Manifesto" rows="4" required value={cForm.manifesto} onChange={(e) => setCForm({ ...cForm, manifesto: e.target.value })} />
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm w-full text-white">Add Candidate</button>
        </form>
      )}
      {tab === "audit" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="text-gray-400 text-left border-b border-gray-800"><th className="py-2">Time</th><th>Event</th><th>Actor</th><th>Details</th></tr></thead><tbody>{logs.map((l) => (<tr key={l.id} className="border-b border-gray-800/50"><td className="py-2 text-gray-400">{new Date(l.timestamp).toLocaleString()}</td><td>{l.event_type}</td><td>{l.actor}</td><td className="text-gray-400">{l.details}</td></tr>))}</tbody></table>
        </div>
      )}
    </div>
  );
}