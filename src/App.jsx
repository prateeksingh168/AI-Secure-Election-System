import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages Import
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
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Voter Routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="voter"><VoterDashboard /></ProtectedRoute>} />
          <Route path="/candidates" element={<ProtectedRoute role="voter"><Candidates /></ProtectedRoute>} />
          <Route path="/candidates/:id" element={<ProtectedRoute role="voter"><CandidateDetails /></ProtectedRoute>} />
          <Route path="/vote" element={<ProtectedRoute role="voter"><Vote /></ProtectedRoute>} />
          <Route path="/vote-confirmation" element={<ProtectedRoute role="voter"><VoteConfirmation /></ProtectedRoute>} />
          
          {/* AI Chat Route (Dono ke liye open hai) */}
          <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}