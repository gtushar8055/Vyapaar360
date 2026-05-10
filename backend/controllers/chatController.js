import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const GEMINI_FALLBACK_MODEL = "gemini-flash-latest";

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

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        message: "Gemini API key missing",
        details: "Set GEMINI_API_KEY in backend/.env and restart the server.",
      });
    }

    const contents = [
      ...(Array.isArray(history)
        ? history
            .filter((item) => item?.content)
            .map((item) => ({
              role: item.role === "assistant" ? "model" : "user",
              parts: [{ text: String(item.content) }],
            }))
        : []),
      { role: "user", parts: [{ text: message }] },
    ];

    const payload = {
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 768,
      },
    };

    const callGemini = async (modelName) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      return response;
    };

    let response = await callGemini(GEMINI_MODEL);

    if (!response.ok) {
      const errText = await response.text();
      const shouldFallback =
        response.status === 404 && GEMINI_MODEL !== GEMINI_FALLBACK_MODEL;

      if (shouldFallback) {
        response = await callGemini(GEMINI_FALLBACK_MODEL);
      } else {
        return res.status(502).json({
          message: "Chat service error",
          details: errText,
        });
      }
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
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not answer that.";

    res.json({ reply });
  } catch (error) {
    console.error("VyapaarChat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
