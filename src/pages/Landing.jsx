import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Landing() {
  const [stats, setStats] = useState({
    voters: 100,
    cast: 30,
    turnout: 30.0,
  });

  useEffect(() => {
    // Attempt to load real-time statistics from backend
    api.get("/elections/E001/results")
      .then((res) => {
        setStats({
          voters: res.data.total_eligible_voters || 100,
          cast: res.data.total_votes_cast || 30,
          turnout: res.data.turnout_percentage || 30.0,
        });
      })
      .catch(() => {
        // Fallback to static seed data aggregates if offline
        setStats({ voters: 100, cast: 30, turnout: 30.0 });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[130px] animate-pulse-glow" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-20 flex flex-col justify-center">
        {/* Hero Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Left Content */}
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              Next-Gen Cryptographic Voting System
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              AI-Secure <br />
              <span className="text-blue-500 text-glow-blue">Digital Elections</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Experience the future of secure, private, and auditable voting. Empowering democracies with biometric identification and AI-driven transparency metrics.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transform hover:-translate-y-0.5 text-center"
              >
                Access Portal
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold transition text-center"
              >
                Learn More
              </a>
            </div>

            {/* Live Analytics Ticker */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-900">
              <div>
                <p className="text-2xl font-bold text-white">{stats.voters}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Registered Voters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.cast}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Votes Recorded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats.turnout}%</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Turnout Rate</p>
              </div>
            </div>
          </div>

          {/* Hero Right: 3D Visual Box representation */}
          <div className="relative flex items-center justify-center">
            {/* Visual Back glows */}
            <div className="absolute w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[80px]" />
            
            {/* 3D Isometric Secure Ballot Box */}
            <div className="w-[300px] h-[300px] perspective-1000 transform-style-3d animate-float">
              <div className="relative w-full h-full transform rotate-x-30 rotate-y-45 transform-style-3d">
                
                {/* 3D Ballot Box Front */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 to-blue-600/40 border border-blue-400/30 rounded-2xl backdrop-blur-xl shadow-glow-blue flex flex-col items-center justify-center translate-z-20">
                  <div className="text-6xl">🗳️</div>
                  <div className="text-sm font-semibold tracking-widest text-blue-400 uppercase mt-4">SECURE BALLOT</div>
                  <div className="w-16 h-1.5 bg-green-400 rounded-full mt-2 animate-pulse" />
                </div>
                
                {/* 3D Ballot Box Top */}
                <div className="absolute inset-x-0 -top-1/2 bottom-1/2 bg-blue-500/20 border border-blue-400/20 rounded-2xl transform origin-bottom rotate-x-90 translate-z-20 backdrop-blur-sm" />
                
                {/* 3D Ballot Box Right */}
                <div className="absolute -right-1/2 inset-y-0 left-1/2 bg-purple-900/30 border border-purple-500/20 rounded-2xl transform origin-left rotate-y-90 translate-z-20 backdrop-blur-sm" />
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Anchor Section */}
      <section id="features" className="border-t border-slate-900 bg-slate-950/50 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Security at Every Step
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-16">
            Designed to guarantee complete vote privacy, prevention of election fraud, and seamless voter verification.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl text-left space-y-4">
              <div className="text-3xl">👤</div>
              <h3 className="text-lg font-bold text-white">Biometric Gatekeeper</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dual biometric verification layers (Face/Retina) with temporary tokens to prevent session spoofing and duplicate voting.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-left space-y-4">
              <div className="text-3xl">🔒</div>
              <h3 className="text-lg font-bold text-white">Anonymized Ballots</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Cryptographically separate audit logging guarantees voter secrecy. No candidate records are tied to voter metadata.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-left space-y-4">
              <div className="text-3xl">🤖</div>
              <h3 className="text-lg font-bold text-white">AI-Powered Transparency</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive election metrics and knowledge base parsing provides real-time audit statistics to keep elections visible and fair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600 relative z-10">
        © 2026 AI-Secure Election System. Enforcing ultimate cryptographic democracy.
      </footer>
    </div>
  );
}
