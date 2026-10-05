import { NextResponse } from "next/server";
import { callAiChat, parseJsonFromAi } from "@/lib/ai/client";

type Lang = "fr" | "en" | "es";

type GenerateBody = {
  action: "generate";
  language: Lang;
  level?: "A2" | "B1" | "B2" | "C1";
};

type EvaluateBody = {
  action: "evaluate";
  language: Lang;
  prompt: string;
  answer: string;
};

type GenerateResult = {
  prompt: string;
  tips: string[];
  expectedFocus: string[];
};

type EvaluateResult = {
  score: number;
  fluency: number;
  clarity: number;
  castingFit: number;
  feedback: string;
  improvedVersion: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody | EvaluateBody;

    if (body.action === "generate") {
      const level = body.level ?? "B1";
      const raw = await callAiChat(
        [
          {
            role: "system",
            content: `Tu génères des tests de communication pour casting cinéma KastMatch.
Langue cible: ${body.language}. Niveau: ${level}.
Réponds UNIQUEMENT en JSON:
{
  "prompt": "consigne orale/écrite pour le talent (dans la langue cible)",
  "tips": ["conseil 1", "conseil 2"],
  "expectedFocus": ["critère 1", "critère 2", "critère 3"]
}`,
          },
          {
            role: "user",
            content:
              "Crée un exercice court (présentation + intention émotionnelle) utile avant une audition.",
          },
        ],
        { useCase: "assessment", temperature: 0.6 },
      );
      const result = parseJsonFromAi<GenerateResult>(raw);
      return NextResponse.json({ ok: true, result });
    }

    if (body.action === "evaluate") {
      const raw = await callAiChat(
        [
          {
            role: "system",
            content: `Tu évalues une réponse de talent pour un test de communication casting.
Langue: ${body.language}.
Réponds UNIQUEMENT en JSON:
{
  "score": 0-100,
  "fluency": 0-100,
  "clarity": 0-100,
  "castingFit": 0-100,
  "feedback": "feedback constructif dans la langue du test",
  "improvedVersion": "version améliorée courte dans la même langue"
}`,
          },
          {
            role: "user",
            content: `PROMPT:\n${body.prompt}\n\nRÉPONSE DU TALENT:\n${body.answer}`,
          },
        ],
        { useCase: "assessment", temperature: 0.3 },
      );
      const result = parseJsonFromAi<EvaluateResult>(raw);
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json(
      { ok: false, error: "action invalide" },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur IA";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
