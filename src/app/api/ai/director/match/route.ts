import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { callAiChat, parseJsonFromAi } from "@/lib/ai/client";
import { aiIsConfigured } from "@/lib/ai/config";
import {
  UNTRUSTED_NOTE,
  assertAiRateLimit,
  cleanSheet,
  sheetSchema,
  structuredScore,
} from "@/lib/ai/director";

export const runtime = "nodejs";

const TOP_N = 10;
const bodySchema = z.object({
  brief: z.string().trim().max(4000).default(""),
  sheet: sheetSchema,
});

const aiSchema = z.object({
  ranking: z.array(
    z.object({
      ref: z.string(),
      score: z.coerce.number().min(0).max(100),
      reason: z.string().max(400).default(""),
      strengths: z.array(z.string()).max(5).default([]),
      risks: z.array(z.string()).max(5).default([]),
    }),
  ),
});

/** Fiche personnage → talents classés (score structuré + analyse IA explicable). */
export async function POST(request: Request) {
  try {
    const session = await requireSession("DIRECTOR");
    const input = bodySchema.parse(await request.json());
    const sheet = cleanSheet(input.sheet);

    const users = await db.user.findMany({
      where: { role: "TALENT" },
      select: {
        id: true,
        name: true,
        talentProfile: true,
        portfolioPhotos: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    });

    const scored = users
      .map((u) => {
        const p = u.talentProfile;
        const sScore = structuredScore(sheet, {
          availability: p?.availability ?? "AVAILABLE",
          languages: p?.languages ?? "",
          roles: p?.roles ?? "",
          gender: p?.gender ?? "",
          ageMin: p?.ageMin ?? null,
          ageMax: p?.ageMax ?? null,
          heightCm: p?.heightCm ?? null,
          build: p?.build ?? "",
          hairColor: p?.hairColor ?? "",
          eyeColor: p?.eyeColor ?? "",
        });
        return { u, p, sScore };
      })
      .sort((a, b) => b.sScore - a.sScore)
      .slice(0, TOP_N);

    type Row = {
      id: string;
      name: string;
      city: string;
      tagline: string;
      photo: string | null;
      structuredScore: number;
      score: number;
      reason: string;
      strengths: string[];
      risks: string[];
    };
    let rows: Row[] = scored.map(({ u, p, sScore }) => ({
      id: u.id,
      name: u.name,
      city: p?.city ?? "",
      tagline: p?.tagline ?? "",
      photo: u.portfolioPhotos[0]?.url ?? null,
      structuredScore: sScore,
      score: sScore,
      reason: "",
      strengths: [],
      risks: [],
    }));

    let aiUsed = false;
    if (rows.length > 0 && aiIsConfigured("matching")) {
      assertAiRateLimit(session.id);
      // Alias T1..Tn : pas de nom ni de contact envoyés au modèle.
      const payload = scored.map(({ p, sScore }, i) => ({
        ref: `T${i + 1}`,
        structuredScore: sScore,
        city: p?.city ?? "",
        roles: p?.roles ?? "",
        languages: p?.languages ?? "",
        tagline: p?.tagline ?? "",
        bio: (p?.bio ?? "").slice(0, 500),
        availability: p?.availability ?? "AVAILABLE",
        physical: {
          gender: p?.gender ?? "",
          playingAge: [p?.ageMin, p?.ageMax],
          heightCm: p?.heightCm,
          build: p?.build ?? "",
          hair: p?.hairColor ?? "",
          eyes: p?.eyeColor ?? "",
          distinctFeatures: p?.distinctFeatures ?? "",
          description: (p?.physicalDescription ?? "").slice(0, 500),
        },
      }));
      try {
        const raw = await callAiChat(
          [
            {
              role: "system",
              content: `Tu es directeur de casting. Tu classes des talents pour un rôle.
${UNTRUSTED_NOTE}
Pour CHAQUE talent donné, réponds en JSON valide uniquement :
{"ranking":[{"ref":"T1","score":0-100,"reason":"1-2 phrases FR concrètes","strengths":["..."],"risks":["..."]}]}
Règles : base-toi sur la fiche personnage et les données fournies ; ne devine rien qui n'est pas dans les données (si une info manque, dis-le dans les risques). N'utilise l'origine ou l'apparence que si la fiche l'exige explicitement. Sois honnête : un score élevé doit être justifié. Le "structuredScore" est un pré-calcul sur les critères physiques/langues, tu peux t'en écarter si tu l'expliques.`,
            },
            {
              role: "user",
              content: `FICHE PERSONNAGE :\n${JSON.stringify(sheet)}\n\nBRIEF D'ORIGINE :\n${input.brief.slice(0, 2000)}\n\nTALENTS :\n${JSON.stringify(payload)}`,
            },
          ],
          { useCase: "matching", temperature: 0.3 },
        );
        const parsed = aiSchema.parse(parseJsonFromAi<unknown>(raw));
        const byRef = new Map(parsed.ranking.map((r) => [r.ref, r]));
        rows = rows.map((row, i) => {
          const r = byRef.get(`T${i + 1}`);
          if (!r) return row;
          return {
            ...row,
            score: Math.round(0.4 * row.structuredScore + 0.6 * r.score),
            reason: r.reason,
            strengths: r.strengths,
            risks: r.risks,
          };
        });
        aiUsed = true;
      } catch {
        // IA indisponible ou réponse invalide : on garde le classement structuré.
      }
    }

    rows.sort((a, b) => b.score - a.score);
    return NextResponse.json({ ok: true, results: rows, aiUsed, totalTalents: users.length });
  } catch (error) {
    return toErrorResponse(error);
  }
}
