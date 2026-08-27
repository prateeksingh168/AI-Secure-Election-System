import { useLocation, Link, Navigate } from "react-router-dom";
export default function VoteConfirmation() {
  const { state } = useLocation();
  if (!state) return <Navigate to="/dashboard" replace />;
  return (
    <div className="max-w-xl mx-auto p-8 mt-10">
      <div className="bg-gray-900 border border-green-700 rounded-2xl p-8 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h1 className="text-2xl font-bold mb-2">Vote Confirmed!</h1>
        <p className="text-gray-400 mb-6">Tumhara vote securely record ho gaya hai.</p>
        <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-300 mb-6">
          <p>Receipt ID: <b className="text-white">{state.vote_id}</b></p>
          <p>Time: <b className="text-white">{new Date(state.timestamp).toLocaleString()}</b></p>
        </div>
        <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white">Back to Dashboard</Link>
      </div>
    </div>
  );
}