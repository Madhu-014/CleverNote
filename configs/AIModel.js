const responseAdapter = (text) => ({
  response: {
    candidates: [
      {
        content: {
          parts: [{ text }],
        },
      },
    ],
  },
});

const coerceText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v : v?.text || v?.content || ""))
      .join("\n")
      .trim();
  }
  if (typeof value === "object") {
    return value.text || value.content || "";
  }
  return String(value);
};

export const chatSession = {
  sendMessage: async (prompt) => {
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || "AI request failed");
    }

    const payload = await response.json();
    return responseAdapter(coerceText(payload?.text));
  },
};
