import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Election rules kya hain?", 
  "Voting procedure batao", 
  "Election schedule kya hai?", 
  "Candidates ki list"
];

// --- YEH HAI ASLI DIMAAG (LOGIC FIX) ---
const getMockAIResponse = (question) => {
  const q = question.toLowerCase();

  // 1. Sabse pehle Candidates check karo
  if (q.includes("candidate") || q.includes("list") || q.includes("kaun") || q.includes("members")) {
    return "🧑💼 Candidates List:\n1. Rahul Sharma (Janata Party)\n2. Priya Singh (Aam Aadmi Party)\n3. Amit Patel (National Party)\n4. Sneha Reddy (Green Party)";
  }

  // 2. Phir Schedule check karo
  if (q.includes("schedule") || q.includes("time") || q.includes("kab") || q.includes("date")) {
    return "📅 Election Schedule:\n• Voting Start: 1 August 2024\n• Voting End: 30 August 2024\n• Result: 31 August 2024";
  }

  // 3. Phir Procedure check karo
  if (q.includes("procedure") || q.includes("kaise") || q.includes("tarika") || q.includes("vote")) {
    return "🗳️ Voting Procedure:\n1. Login karo.\n2. Candidate select karo.\n3. Face Enrollment/Verification karo.\n4. Vote confirm karo.";
  }

  // 4. Last me Rules check karo
  if (q.includes("rule") || q.includes("niyam") || q.includes("eligibility")) {
    return "📜 Election Rules:\n1. Ek voter sirf ek baar vote de sakta hai.\n2. Voter ki umar 18 saal se zyada honi chahiye.\n3. Face verification zaroori hai.";
  }

  // Default
  return " Mujhe samajh nahi aaya. Please niche diye gaye buttons par click karke puchein.";
};

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste!  Main AI Election Assistant hoon. Election rules, voting procedure, schedule ya candidates ke baare me poochho." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;

    // User ka message add karo
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    // 1 second baad AI ka jawab
    setTimeout(() => {
      const reply = getMockAIResponse(q);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-[calc(100vh-100px)]">
      <h1 className="text-xl font-bold mb-4 text-white"> AI Election Assistant</h1>
      
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-gray-900 border border-gray-800 rounded-2xl p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line shadow-md ${
              m.role === "user" 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <p className="text-gray-500 text-sm ml-2">Assistant typing...</p>}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion Buttons */}
      <div className="flex gap-2 flex-wrap mt-4">
        {SUGGESTIONS.map((s) => (
          <button 
            key={s} 
            onClick={() => send(s)} 
            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-full text-white transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 mt-4">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && send()} 
          placeholder="Apna sawaal yahan likhein..." 
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-blue-500 focus:outline-none transition" 
        />
        <button 
          onClick={() => send()} 
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold text-white transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}