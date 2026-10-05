import { NextResponse } from "next/server";
import { callAiChat, type ChatMessage } from "@/lib/ai/client";

type CoachBody = {
  message?: string;
  castingBrief?: string;
  mode?: "coach" | "pitch";
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CoachBody;
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json(
        { ok: false, error: "message requis" },
        { status: 400 },
      );
    }

    const pitchMode = body.mode === "pitch";
    const system: ChatMessage = {
      role: "system",
      content: pitchMode
        ? `Tu es Kast, agent IA KastMatch spécialisé en pitch casting / cinéma.
Tu aides à écrire un pitch oral 30–60 secondes : crochet, qui tu es, intention, pourquoi ce rôle/projet, close.
Style: punchy, caméra-ready, pas corporate. Propose 1 version principale + variante courte.
Langues: FR/EN/ES selon la demande.`
        : `Tu es KastCoach, agent IA KastMatch qui aide les talents à préparer un casting cinéma/pub.
Style: direct, bienveillant, concret (exercices, intentions, sous-texte, présence caméra).
Langues: réponds dans la langue du talent (FR/EN/ES selon le message).
Si un brief casting est fourni, ancre tes conseils dessus.
Propose parfois un mini-exercice (30–60s) ou 3 questions d'intention.
Pas de blabla marketing.`,
    };

    const history = (body.history ?? []).slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const messages: ChatMessage[] = [
      system,
      ...(body.castingBrief
        ? ([
            {
              role: "system",
              content: `Brief casting courant:\n${body.castingBrief}`,
            },
          ] as ChatMessage[])
        : []),
      ...history,
      { role: "user", content: message },
    ];

    const reply = await callAiChat(messages, {
      useCase: "coach",
      temperature: 0.55,
    });

    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur IA";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
