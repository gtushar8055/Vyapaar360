import dotenv from "dotenv";

dotenv.config();

const CHAT_PROVIDER = (process.env.CHAT_PROVIDER || "groq").toLowerCase();
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_BASE_URL =
  process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_TIMEOUT_MS = 20000;

const getMessageText = (responseMessage) => {
  if (typeof responseMessage?.content === "string") {
    return responseMessage.content.trim();
  }

  if (!Array.isArray(responseMessage?.content)) {
    return "";
  }

  return responseMessage.content
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
};

const buildSystemPrompt = ({ shop, user }) => {
  const shopName = shop?.shopName || "the shop";
  const ownerName = user?.name || "the owner";

  return [
    "You are VyapaarChat, a helpful assistant for the Vyapaar360 platform.",
    "Your job is to answer questions about features, workflows, and reports.",
    "Be concise, practical, and friendly. Avoid making up data.",
    "Keep replies under 8 short sentences unless asked for more detail.",
    "If the user asks for numbers, explain where to find them in the app.",
    "Platform context:",
    "- Users log in and manage a single shop profile.",
    "- Inventory is updated via Purchases and Sales.",
    "- Sales generate invoices with GST and update customer balances.",
    "- Dashboard shows KPIs: today sales, monthly sales, purchases, GST, low stock.",
    "- Smart Insights show dead stock, reorder suggestions, payment risk.",
    "- Reports page can download PDF reports (today, monthly, sales summary).",
    `Current shop: ${shopName}. Owner: ${ownerName}.`,
    "When unsure, ask a short follow-up question.",
  ].join("\n");
};

export const chatWithAssistant = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    const systemPrompt = buildSystemPrompt({
      shop: req.shop,
      user: req.user,
    });

    if (CHAT_PROVIDER !== "groq") {
      return res.status(400).json({
        message: "Unsupported chat provider",
        details: "Set CHAT_PROVIDER=groq to use the Groq chat integration.",
      });
    }

    if (!GROQ_API_KEY) {
      return res.status(400).json({
        message: "Groq API key missing",
        details: "Set GROQ_API_KEY in backend/.env and restart the server.",
      });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history)
        ? history
            .filter((item) => item?.content)
            .map((item) => ({
              role: item.role === "assistant" ? "assistant" : "user",
              content: String(item.content),
            }))
        : []),
      { role: "user", content: message },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

    let response;

    try {
      response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: 0.2,
          max_tokens: 768,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({
        message: "Chat service error",
        details: errText,
      });
    }

    const data = await response.json();
    const reply =
      getMessageText(data?.choices?.[0]?.message) ||
      "Sorry, I could not answer that.";

    res.json({ reply });
  } catch (error) {
    const isTimeout = error?.name === "AbortError";

    console.error("VyapaarChat error:", error);
    res.status(isTimeout ? 504 : 500).json({
      message: isTimeout ? "Chat service timeout" : "Server error",
      details: isTimeout
        ? "The Groq request did not respond in time."
        : "Unexpected server error.",
    });
  }
};
