import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function Landing() {
  const [stats, setStats] = useState({ voters: 100, cast: 30, turnout: 30.0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef(null);

  // Mouse tilt handler for 3D Ballot Box
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 30, y: -y * 30 }); // Tilt up to 30 degrees
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Scroll listener for 3D scroll rotations and parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Live Statistics Fetch
  useEffect(() => {
    api.get("/elections/E001/results")
      .then((res) => {
        setStats({
          voters: res.data.total_eligible_voters || 100,
          cast: res.data.total_votes_cast || 30,
          turnout: res.data.turnout_percentage || 30.0,
        });
      })
      .catch(() => {
        setStats({ voters: 100, cast: 30, turnout: 30.0 });
      });
  }, []);

  // High Performance Canvas Interactive Network Particles Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? "rgba(59, 130, 246, 0.4)" : "rgba(168, 85, 247, 0.3)";
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < 70; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col relative overflow-hidden cyber-grid">
      {/* Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Atmospheric Radial Blur Overlays */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full bg-purple-500/5 blur-[160px] pointer-events-none" />

      {/* Hero Section */}
      <header className="relative z-10 flex-1 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32 flex flex-col justify-center min-h-[90vh]">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content Left */}
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 backdrop-blur-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              Decentralized Cryptographic Shield
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 leading-tight">
              AI-Secure <br />
              <span className="text-blue-500 text-glow-blue">Digital Democracy</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              Enforcing ballot secrecy, hardware-based biometric verification, and zero voter-identity tracking using the latest advancements in cryptographic vote validation.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transform hover:-translate-y-0.5 text-center duration-300"
              >
                Access Election Portal
              </Link>
              <a
                href="#manifest"
                className="px-8 py-4 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold transition text-center duration-300 backdrop-blur-md"
              >
                Inspect Mechanism
              </a>
            </div>

            {/* Statistics Dashboard Ticker */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-900">
              <div>
                <p className="text-3xl font-extrabold text-white">{stats.voters}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Registered Voters</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-blue-400">{stats.cast}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Votes Audited</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-purple-400">{stats.turnout}%</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Turnout Rate</p>
              </div>
            </div>
          </div>

          {/* Interactive 3D Rotation Showcase Container */}
          <div 
            className="relative flex items-center justify-center min-h-[400px] cursor-grab active:cursor-grabbing"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div 
              className="w-[320px] h-[320px] perspective-2000 transform-style-3d duration-200"
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) rotateZ(${scrollY * 0.05}deg)`
              }}
            >
              <div className="relative w-full h-full transform-style-3d">
                {/* 3D Ballot Box Front */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 to-blue-600/40 border border-blue-400/30 rounded-3xl backdrop-blur-2xl shadow-glow-blue flex flex-col items-center justify-center transform translate-z-20">
                  <div className="text-7xl drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">🛡️</div>
                  <div className="text-sm font-bold tracking-widest text-blue-400 uppercase mt-5">SECURE SHIELD</div>
                  <div className="w-20 h-1.5 bg-emerald-400 rounded-full mt-3 animate-pulse shadow-glow-emerald" />
                </div>
                
                {/* 3D Ballot Box Top */}
                <div className="absolute inset-x-0 -top-1/2 bottom-1/2 bg-blue-500/25 border border-blue-400/20 rounded-3xl transform origin-bottom rotate-x-90 translate-z-20 backdrop-blur-sm" />
                
                {/* 3D Ballot Box Side */}
                <div className="absolute -right-1/2 inset-y-0 left-1/2 bg-purple-900/30 border border-purple-500/20 rounded-3xl transform origin-left rotate-y-90 translate-z-20 backdrop-blur-sm" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Storytelling Mechanism Overview */}
      <section id="manifest" className="relative z-10 border-t border-slate-900 bg-slate-950/60 py-32 cyber-dots">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Cryptographic Safeguards
            </h2>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Designed against state-level interference patterns, verifying individual identities while keeping voter records detached from ballot counts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div 
              className="glass-card-premium p-8 rounded-2xl text-left space-y-4 transform-style-3d duration-300"
              style={{ transform: `translateY(${scrollY * -0.02}px)` }}
            >
              <div className="text-4xl">📸</div>
              <h3 className="text-xl font-bold text-white">Biometric Vault</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Persistent rate-limiting lockouts verify faces through vector embedding comparisons, preventing duplicate vote attacks and credentials spoofing.
              </p>
            </div>

            <div 
              className="glass-card-premium p-8 rounded-2xl text-left space-y-4 transform-style-3d duration-300"
              style={{ transform: `translateY(${scrollY * -0.04}px)` }}
            >
              <div className="text-4xl">🔒</div>
              <h3 className="text-xl font-bold text-white">Decoupled Ballots</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Voter participation statuses and cast votes are stored in separated tables without correlation tags, ensuring absolute ballot secrecy.
              </p>
            </div>

            <div 
              className="glass-card-premium p-8 rounded-2xl text-left space-y-4 transform-style-3d duration-300"
              style={{ transform: `translateY(${scrollY * -0.06}px)` }}
            >
              <div className="text-4xl">🤖</div>
              <h3 className="text-xl font-bold text-white">AI Transparency Auditor</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Authorized NLP assistants analyze live turnouts and candidate profiles directly from restricted database routers without leaking private identifiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#020617] py-10 text-center text-xs text-slate-500 relative z-10">
        © 2026 AI-Secure Election System. Engineered with next-gen cryptographic vote audit protocols.
      </footer>
    </div>
  );
}
