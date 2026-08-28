import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [tab, setTab] = useState("elections");
  const [elections, setElections] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Forms
  const [cForm, setCForm] = useState({ name: "", department: "", symbol: "", manifesto: "" });
  const [eForm, setEForm] = useState({ title: "", description: "", start_date: "", end_date: "" });
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [logPage, setLogPage] = useState(1);

  const load = () => {
    setError("");
    api.get("/elections")
      .then((r) => {
        setElections(r.data);
        if (r.data.length > 0 && !selectedElectionId) {
          setSelectedElectionId(r.data[0].election_id);
        }
      })
      .catch((err) => {
        console.error("Failed to load elections:", err);
        setError("Error loading elections from backend.");
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    api.get(`/audit-logs?page=${logPage}&limit=10`)
      .then((r) => setLogs(r.data))
      .catch((err) => {
        console.error("Failed to load audit logs:", err);
      });
  }, [logPage, tab]);

  const handleSetStatus = async (id, status) => {
    try {
      setError("");
      setMsg("");
      await api.patch(`/elections/${id}/status`, { status });
      setMsg(`Election status updated to ${status}.`);
      load();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to update election status.");
    }
  };

  const createElection = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setMsg("");
      // Format dates correctly
      await api.post("/elections", {
        title: eForm.title,
        description: eForm.description || "Digital voting election",
        start_date: eForm.start_date,
        end_date: eForm.end_date,
        rules_version: "1.0"
      });
      setEForm({ title: "", description: "", start_date: "", end_date: "" });
      setMsg("Election created successfully.");
      load();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create election.");
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    if (!selectedElectionId) {
      setError("Please select or create an election first.");
      return;
    }
    try {
      setError("");
      setMsg("");
      await api.post(`/elections/${selectedElectionId}/candidates`, cForm);
      setCForm({ name: "", department: "", symbol: "", manifesto: "" });
      setMsg("Candidate registered successfully for the election.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to register candidate.");
    }
  };

  const inputStyle = "w-full mb-3 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 outline-none focus:border-blue-500 text-sm text-white transition";
  
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <span>💼</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Admin Control Center
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">Election Configuration & Audits</p>
        </div>
      </div>

      {msg && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-300 text-sm p-4 rounded-xl">
          ✓ {msg}
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 text-sm p-4 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {["elections", "candidates", "audit"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition capitalize ${
              tab === t 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {t === "audit" ? "Audit Trails" : t}
          </button>
        ))}
      </div>

      {/* Elections Tab */}
      {tab === "elections" && (
        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={createElection} className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">➕ Create New Election</h2>
            
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Title</label>
              <input className={inputStyle} placeholder="Student Council Election 2026" required value={eForm.title} onChange={(e) => setEForm({ ...eForm, title: e.target.value })} />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Description</label>
              <input className={inputStyle} placeholder="E.g. College representatives selection" value={eForm.description} onChange={(e) => setEForm({ ...eForm, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Start Date</label>
                <input className={inputStyle} type="date" required value={eForm.start_date} onChange={(e) => setEForm({ ...eForm, start_date: e.target.value })} />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">End Date</label>
                <input className={inputStyle} type="date" required value={eForm.end_date} onChange={(e) => setEForm({ ...eForm, end_date: e.target.value })} />
              </div>
            </div>

            <button className="bg-blue-600 hover:bg-blue-500 w-full py-3 rounded-xl font-bold text-white transition mt-2">
              Provision Election
            </button>
          </form>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Active & Draft Elections</h2>
            {elections.length === 0 ? (
              <p className="text-slate-500 text-sm">No elections configured.</p>
            ) : (
              elections.map((el) => (
                <div key={el.election_id} className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-base">{el.title}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: <span className="font-mono">{el.election_id}</span></p>
                    <p className="text-xs text-slate-400">Duration: {el.start_date} to {el.end_date}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      el.status === "active" ? "bg-green-950 text-green-400 border border-green-800" :
                      el.status === "closed" ? "bg-red-950 text-red-400 border border-red-800" :
                      "bg-slate-900 text-slate-400 border border-slate-800"
                    }`}>
                      {el.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {el.status === "DRAFT" && (
                      <button
                        onClick={() => handleSetStatus(el.election_id, "active")}
                        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition"
                      >
                        Activate
                      </button>
                    )}
                    {el.status === "active" && (
                      <button
                        onClick={() => handleSetStatus(el.election_id, "closed")}
                        className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Candidates Tab */}
      {tab === "candidates" && (
        <form onSubmit={addCandidate} className="glass-panel p-8 rounded-2xl max-w-xl space-y-4">
          <h2 className="text-lg font-bold text-white mb-2"> Add Candidate</h2>
          
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Target Election</label>
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="w-full mb-3 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white outline-none focus:border-blue-500 transition"
            >
              {elections.map((el) => (
                <option key={el.election_id} value={el.election_id}>
                  {el.title} ({el.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Candidate Name</label>
            <input className={inputStyle} placeholder="Aditi Sharma" required value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Department</label>
              <input className={inputStyle} placeholder="CS / Mech / ECE" required value={cForm.department} onChange={(e) => setCForm({ ...cForm, department: e.target.value })} />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Symbol / Logo Code</label>
              <input className={inputStyle} placeholder="✊ / 🛡️ / 🚀" required value={cForm.symbol} onChange={(e) => setCForm({ ...cForm, symbol: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Manifesto Description</label>
            <textarea className={inputStyle} placeholder="Describe manifestos & focus areas..." rows="4" required value={cForm.manifesto} onChange={(e) => setCForm({ ...cForm, manifesto: e.target.value })} />
          </div>

          <button className="bg-blue-600 hover:bg-blue-500 w-full py-3 rounded-xl font-bold text-white transition mt-2">
            Register Candidate
          </button>
        </form>
      )}

      {/* Audit Tab */}
      {tab === "audit" && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4">Secure Log Audits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-900">
                  <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Event Action</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actor Class</th>
                  <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Actor ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.log_id} className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        l.status === "SUCCESS" ? "bg-green-950 text-green-400 border border-green-800" : "bg-red-950 text-red-400 border border-red-800"
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-300">{l.actor_type}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">{l.actor_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={logPage === 1}
              onClick={() => setLogPage(logPage - 1)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-45 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold text-slate-300"
            >
              ← Previous Page
            </button>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Page {logPage}</span>
            <button
              disabled={logs.length < 10}
              onClick={() => setLogPage(logPage + 1)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-45 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold text-slate-300"
            >
              Next Page →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}