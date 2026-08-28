import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages Import
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import VoterDashboard from "./pages/VoterDashboard";
import Candidates from "./pages/Candidates";
import CandidateDetails from "./pages/CandidateDetails";
import Vote from "./pages/Vote";
import VoteConfirmation from "./pages/VoteConfirmation";
import AIChat from "./pages/AIChat"; // Ye line zaroori hai
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#020617] text-slate-100 font-sans">
        <Navbar />
        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Landing />} />
          
          {/* Separate Login Portals */}
          <Route path="/voter" element={<Login portal="voter" />} />
          <Route path="/admin" element={<Login portal="admin" />} />
          <Route path="/login" element={<Navigate to="/voter" replace />} />

          {/* Voter Namespace Routes */}
          <Route path="/voter/dashboard" element={<ProtectedRoute role="voter"><VoterDashboard /></ProtectedRoute>} />
          <Route path="/voter/candidates" element={<ProtectedRoute role="voter"><Candidates /></ProtectedRoute>} />
          <Route path="/voter/candidates/:id" element={<ProtectedRoute role="voter"><CandidateDetails /></ProtectedRoute>} />
          <Route path="/voter/vote" element={<ProtectedRoute role="voter"><Vote /></ProtectedRoute>} />
          <Route path="/voter/vote-confirmation" element={<ProtectedRoute role="voter"><VoteConfirmation /></ProtectedRoute>} />
          <Route path="/voter/ai-chat" element={<ProtectedRoute role="voter"><AIChat /></ProtectedRoute>} />

          {/* Admin Namespace Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />
          <Route path="/admin/ai-chat" element={<ProtectedRoute role="admin"><AIChat /></ProtectedRoute>} />

          {/* Legacy & Redirect Fallbacks */}
          <Route path="/candidates" element={<Navigate to="/voter/candidates" replace />} />
          <Route path="/dashboard" element={<Navigate to="/voter/dashboard" replace />} />
          <Route path="/vote" element={<Navigate to="/voter/vote" replace />} />
          <Route path="/ai-chat" element={<Navigate to="/voter/ai-chat" replace />} />
          <Route path="*" element={<Navigate to="/voter" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}