import { NextResponse } from "next/server";
import { callAiChat, parseJsonFromAi } from "@/lib/ai/client";

type MatchBody = {
  castingTitle?: string;
  castingBrief?: string;
  role?: string;
  talentName?: string;
  talentProfile?: string;
};

type MatchResult = {
  matchScore: number;
  roleMatch: number;
  voice: number;
  microExpressions: number;
  summary: string;
  strengths: string[];
  risks: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MatchBody;
    const castingBrief =
      body.castingBrief?.trim() ||
      `${body.castingTitle ?? "Casting"} — rôle: ${body.role ?? "n/a"}`;
    const talentProfile =
      body.talentProfile?.trim() ||
      `Talent: ${body.talentName ?? "candidat"}`;

    const raw = await callAiChat(
      [
        {
          role: "system",
          content: `Tu es le moteur de matching prédictif KastMatch (casting cinéma).
Analyse le fit talent ↔ casting. Réponds UNIQUEMENT en JSON valide:
{
  "matchScore": 0-100,
  "roleMatch": 0-100,
  "voice": 0-100,
  "microExpressions": 0-100,
  "summary": "2 phrases FR",
  "strengths": ["..."],
  "risks": ["..."]
}
voice et microExpressions sont des proxies textuels (d'après bio/tagline/expérience), pas de vraie vidéo — reste honnête mais utile pour shortlist.`,
        },
        {
          role: "user",
          content: `CASTING:\n${castingBrief}\n\nTALENT:\n${talentProfile}`,
        },
      ],
      { useCase: "matching", temperature: 0.3 },
    );

    const parsed = parseJsonFromAi<MatchResult>(raw);
    return NextResponse.json({ ok: true, result: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur IA";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
