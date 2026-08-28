import { useLocation, Link, Navigate } from "react-router-dom";

export default function VoteConfirmation() {
  const { state } = useLocation();

  if (!state) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[80px]" />

      <div className="glass-panel-premium p-8 rounded-3xl w-full max-w-lg text-center space-y-6 relative z-10 border border-emerald-500/20 shadow-glow-emerald">
        {/* Animated bounce check badge */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center text-4xl mx-auto animate-bounce shadow-glow-emerald">
          ✓
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Ballot Submitted!</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold text-emerald-400">Vote Cast Successfully</p>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-900">
          Your vote has been cryptographically recorded. To preserve complete ballot anonymity, your voter profile has been decoupled from the candidate choice inside the database records.
        </p>

        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 text-left space-y-3 font-medium text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-900">
            <span className="text-slate-500 uppercase tracking-wider">Receipt Hash</span>
            <span className="text-white font-mono font-bold bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">{state.vote_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 uppercase tracking-wider">Timestamp (Hour-Truncated)</span>
            <span className="text-slate-300 font-semibold">{state.timestamp ? new Date(state.timestamp).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true }) : "Recent"}</span>
          </div>
        </div>

        <div className="pt-2">
          <Link 
            to="/voter/dashboard" 
            className="inline-block w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold text-white transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 text-sm"
          >
            Return to Voter Panel
          </Link>
        </div>
      </div>
    </div>
  );
}