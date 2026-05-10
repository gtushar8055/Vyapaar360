import { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";

const starterQuestions = [
  "How do I generate an invoice?",
  "Where can I see low stock items?",
  "How is GST calculated in sales?",
  "How do I download monthly reports?",
];

export default function VyapaarChat() {
  const storageKey = "vyapaarchat_messages";
  const maxHistoryItems = 10;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      return [];
    }

    return [
      {
        role: "assistant",
        content:
          "Hi, I am VyapaarChat. Ask me anything about Vyapaar360 features or workflows.",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore storage failures (private mode / quota).
    }
  }, [messages]);

  const history = useMemo(() => {
    const cleaned = messages
      .filter((m) => m.role !== "system")
      .map(({ role, content }) => ({ role, content }));

    if (cleaned.length <= maxHistoryItems) return cleaned;
    return cleaned.slice(-maxHistoryItems);
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "/chat",
        {
          message: trimmed,
          history,
        },
        { timeout: 20000 },
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, the assistant is unavailable. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A304B]">VyapaarChat</h1>
            <p className="text-gray-500">
              Ask questions about features, workflows, and reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    role: "assistant",
                    content:
                      "Hi, I am VyapaarChat. Ask me anything about Vyapaar360 features or workflows.",
                  },
                ])
              }
              className="text-sm px-3 py-1 border border-[#1A304B] rounded-full text-[#1A304B] hover:bg-slate-50"
            >
              Clear
            </button>
            <img
              src="/Smart-insights.png"
              alt="VyapaarChat"
              className="size-16 object-contain animate-float"
            />
          </div>
        </div>

        <div className="bg-white border-4 border-[#1A304B] rounded-xl shadow p-5 mb-5">
          <div className="flex flex-wrap gap-2">
            {starterQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-sm px-3 py-1 border border-[#1A304B] rounded-full text-[#1A304B] hover:bg-slate-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border-4 border-[#1A304B] rounded-xl shadow p-5 h-[420px] overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={`mb-4 flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#1A304B] text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about inventory, sales, GST, reports..."
            className="flex-1 border p-3 rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1A304B] text-white px-4 py-3 rounded-lg"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
