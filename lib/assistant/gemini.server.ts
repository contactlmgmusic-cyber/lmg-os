import "server-only";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function extractText(payload: any): string {
  return (payload?.candidates?.[0]?.content?.parts || [])
    .map((part: { text?: unknown }) => typeof part?.text === "string" ? part.text : "")
    .join("")
    .trim();
}

export async function completeWithGemini(messages: ChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_NOT_CONFIGURED");

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const systemInstruction = messages.find((message) => message.role === "system")?.content || "";
  const contents = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { temperature: 0.35, maxOutputTokens: 3000 },
    }),
    signal: AbortSignal.timeout(55_000),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Gemini API error", response.status, payload?.error?.status || payload?.error?.message || "unknown");
    if (response.status === 429) throw new Error("GEMINI_RATE_LIMIT");
    if (response.status === 401 || response.status === 403) throw new Error("GEMINI_AUTH_ERROR");
    throw new Error("GEMINI_API_ERROR");
  }

  const content = extractText(payload);
  if (!content) throw new Error("GEMINI_EMPTY_RESPONSE");
  return { content, model };
}
