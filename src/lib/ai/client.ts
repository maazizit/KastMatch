import { aiBaseUrl, aiIsConfigured, aiModelFor, type AiUseCase } from "./config";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callAiChat(
  messages: ChatMessage[],
  options: { useCase: AiUseCase; temperature?: number },
): Promise<string> {
  if (!aiIsConfigured(options.useCase)) {
    throw new Error(
      "AI non configurée. Définis AI_API_BASE, AI_API_KEY et AI_MODEL dans .env.local",
    );
  }

  const model = aiModelFor(options.useCase);
  const res = await fetch(`${aiBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": process.env.AI_USER_AGENT || "KastMatch/0.1",
      "HTTP-Referer": "https://kastmatch.local",
      "X-Title": "KastMatch",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI provider error ${res.status}: ${text.slice(0, 240)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Réponse IA vide");
  return content;
}

/** Extract JSON object from model output (tolerates markdown fences). */
export function parseJsonFromAi<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("JSON IA introuvable");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
