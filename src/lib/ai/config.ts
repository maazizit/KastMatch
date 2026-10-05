export type AiUseCase = "matching" | "coach" | "assessment" | "default";

const MODEL_ENV: Record<AiUseCase, string> = {
  matching: "AI_MODEL_MATCHING",
  coach: "AI_MODEL_COACH",
  assessment: "AI_MODEL_ASSESSMENT",
  default: "AI_MODEL",
};

export function aiModelFor(useCase: AiUseCase): string | null {
  const specific = process.env[MODEL_ENV[useCase]]?.trim();
  if (specific) return specific;
  return process.env.AI_MODEL?.trim() || null;
}

export function aiIsConfigured(useCase: AiUseCase = "default"): boolean {
  return Boolean(
    process.env.AI_API_KEY?.trim() &&
      process.env.AI_API_BASE?.trim() &&
      aiModelFor(useCase),
  );
}

export function aiBaseUrl(): string {
  return (process.env.AI_API_BASE || "").replace(/\/$/, "");
}
