import { useState, useRef, useEffect } from "react";
import api from "../api/axios";

const SUGGESTIONS = [
  "Election rules kya hain?", 
  "Voting procedure batao", 
  "Live Turnout stats?", 
  "Candidates ki list",
  "Vote secrecy and security?"
];

export default function AIChat() {
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste! Main AI Election Assistant hoon. Election rules, voting procedure, live turnout, ya candidates ke baare me poochho." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Fetch live election context & knowledge base from backend
    api.get("/ai/context/E001")
      .then((res) => {
        setContext(res.data);
      })
      .catch((err) => {
        console.error("Failed to load AI election context:", err);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processResponse = (question) => {
    const q = question.toLowerCase();
    
    if (!context) {
      return "Main election records loading kar raha hoon. Please thodi der baad try karein.";
    }

    // 1. Check Candidates
    if (q.includes("candidate") || q.includes("list") || q.includes("kaun") || q.includes("pratyashi")) {
      const candidatesText = context.candidates.map((c, i) => (
        `${i + 1}. **${c.name}** (${c.symbol}) - Dept: ${c.department}\n   *Manifesto: ${c.manifesto}*`
      )).join("\n\n");
      return `🧑💼 **Registered Candidates for ${context.title}:**\n\n${candidatesText || "Elections list empty."}`;
    }

    // 2. Check Turnout / Live stats
    if (q.includes("turnout") || q.includes("stats") || q.includes("vote") || q.includes("voting percent") || q.includes("percent")) {
      const t = context.turnout;
      return `📊 **Live Turnout Statistics:**\n\n• **Total Eligible Voters**: ${t.total_eligible_voters}\n• **Total Votes Cast**: ${t.total_votes_cast}\n• **Overall Turnout Rate**: **${t.turnout_percentage}%**`;
    }

    // 3. Check Voting Procedure
    if (q.includes("procedure") || q.includes("process") || q.includes("tarika") || q.includes("steps")) {
      const procedureText = context.knowledge_base?.voting_procedure?.map((item) => (
        `• **${item.title}**: ${item.content}`
      )).join("\n");
      return `🗳️ **Official Voting Procedure:**\n\n${procedureText || "1. Login\n2. Select Candidate\n3. Biometric Verification\n4. Confirm Vote"}`;
    }

    // 4. Check Schedule
    if (q.includes("schedule") || q.includes("date") || q.includes("timeline") || q.includes("kab")) {
      const scheduleText = context.knowledge_base?.election_schedule?.map((item) => (
        `• **${item.title}**: ${item.content}`
      )).join("\n");
      return `📅 **Election Schedule & Timelines:**\n\n${scheduleText || "Voting period active between election start and end dates."}`;
    }

    // 5. Check Rules
    if (q.includes("rule") || q.includes("niyam") || q.includes("eligibility") || q.includes("yogyata")) {
      const rulesText = context.knowledge_base?.election_rules?.map((item) => (
        `• **${item.title}**: ${item.content}`
      )).join("\n");
      return `📜 **Election Rules:**\n\n${rulesText || "Each eligible voter can vote exactly once in active elections."}`;
    }

    // 6. Check Security or FAQs
    if (q.includes("security") || q.includes("secrecy") || q.includes("safe") || q.includes("privacy")) {
      const secText = context.knowledge_base?.security_information?.map((item) => (
        `• **${item.title}**: ${item.content}`
      )).join("\n");
      return `🔒 **Security & Anonymity Features:**\n\n${secText || "Voter choice is decoupled from voter identity to ensure total secrecy."}`;
    }

    // 7. General FAQs matching
    const faqs = context.knowledge_base?.faqs || [];
    const matchedFaq = faqs.find(f => q.includes(f.title.toLowerCase()) || f.title.toLowerCase().split(" ").some(word => word.length > 3 && q.includes(word)));
    if (matchedFaq) {
      return `❓ **${matchedFaq.title}**\n\n${matchedFaq.content}`;
    }

    // Default Fallback
    return `Main aapka question sahi se samajh nahi paya. Niche diye gaye questions me se kisi par click karke dekhein ya general rules, candidates aur live turnout ke baare me puchein.`;
  };

  const send = (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const reply = processResponse(q);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
      setLoading(false);
    }, 850);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[calc(100vh-100px)] space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>🤖</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AI Election Assistant
          </span>
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">Knowledge base queries</p>
      </div>
      
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-inner">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm whitespace-pre-line shadow-md leading-relaxed ${
              m.role === "user" 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs ml-2 animate-pulse">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
            <span>Analyzing query...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion Buttons */}
      <div className="flex gap-2 flex-wrap">
        {SUGGESTIONS.map((s) => (
          <button 
            key={s} 
            onClick={() => send(s)} 
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-full text-slate-300 hover:text-white transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex gap-3">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && send()} 
          placeholder="Ask rules, candidate manifestos, live turnout..." 
          className="flex-1 px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:outline-none text-sm transition" 
        />
        <button 
          onClick={() => send()} 
          className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/10 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}