import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { callAiChat, parseJsonFromAi } from "@/lib/ai/client";
import { aiIsConfigured } from "@/lib/ai/config";
import { UNTRUSTED_NOTE, assertAiRateLimit, cleanSheet, sheetSchema } from "@/lib/ai/director";

export const runtime = "nodejs";

const bodySchema = z.object({
  brief: z.string().trim().max(4000).default(""),
  sheet: sheetSchema,
  talentIds: z.array(z.string().min(1)).min(2).max(3),
});

const aiSchema = z.object({
  talents: z.array(
    z.object({
      ref: z.string(),
      fit: z.coerce.number().min(0).max(100),
      strengths: z.array(z.string()).max(5).default([]),
      risks: z.array(z.string()).max(5).default([]),
    }),
  ),
  recommendation: z.string().max(600).default(""),
  differentiators: z.array(z.string()).max(5).default([]),
});

/** Benchmark : 2–3 talents comparés sur le même rôle. */
export async function POST(request: Request) {
  try {
    const session = await requireSession("DIRECTOR");
    const input = bodySchema.parse(await request.json());
    if (!aiIsConfigured("matching")) {
      return NextResponse.json({ ok: false, error: "IA non configurée côté serveur" }, { status: 503 });
    }
    assertAiRateLimit(session.id);
    const sheet = cleanSheet(input.sheet);

    const users = await db.user.findMany({
      where: { id: { in: input.talentIds }, role: "TALENT" },
      select: { id: true, name: true, talentProfile: true },
    });
    const ordered = input.talentIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is NonNullable<typeof u> => Boolean(u));
    if (ordered.length < 2) {
      return NextResponse.json({ ok: false, error: "Talents introuvables" }, { status: 404 });
    }

    const payload = ordered.map((u, i) => {
      const p = u.talentProfile;
      return {
        ref: `T${i + 1}`,
        city: p?.city ?? "",
        roles: p?.roles ?? "",
        languages: p?.languages ?? "",
        tagline: p?.tagline ?? "",
        bio: (p?.bio ?? "").slice(0, 600),
        availability: p?.availability ?? "AVAILABLE",
        hasShowreel: Boolean(p?.showreelUrl),
        physical: {
          gender: p?.gender ?? "",
          playingAge: [p?.ageMin, p?.ageMax],
          heightCm: p?.heightCm,
          build: p?.build ?? "",
          hair: p?.hairColor ?? "",
          eyes: p?.eyeColor ?? "",
          distinctFeatures: p?.distinctFeatures ?? "",
          description: (p?.physicalDescription ?? "").slice(0, 600),
        },
      };
    });

    const raw = await callAiChat(
      [
        {
          role: "system",
          content: `Tu es directeur de casting. Compare ces talents pour UN même rôle.
${UNTRUSTED_NOTE}
Réponds en JSON valide uniquement :
{"talents":[{"ref":"T1","fit":0-100,"strengths":["..."],"risks":["..."]}],"recommendation":"qui choisir et pourquoi, 2-3 phrases FR","differentiators":["ce qui les distingue vraiment, court"]}
Sois honnête et concret ; signale les informations manquantes plutôt que de les inventer. N'utilise l'origine/apparence que si la fiche l'exige explicitement.`,
        },
        {
          role: "user",
          content: `FICHE PERSONNAGE :\n${JSON.stringify(sheet)}\n\nBRIEF :\n${input.brief.slice(0, 2000)}\n\nTALENTS :\n${JSON.stringify(payload)}`,
        },
      ],
      { useCase: "matching", temperature: 0.3 },
    );
    const parsed = aiSchema.parse(parseJsonFromAi<unknown>(raw));

    const talents = ordered.map((u, i) => {
      const r = parsed.talents.find((t) => t.ref === `T${i + 1}`);
      return {
        id: u.id,
        name: u.name,
        fit: Math.round(r?.fit ?? 0),
        strengths: r?.strengths ?? [],
        risks: r?.risks ?? [],
      };
    });
    return NextResponse.json({
      ok: true,
      talents,
      recommendation: parsed.recommendation,
      differentiators: parsed.differentiators,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
