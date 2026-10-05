import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { deleteStoredVideo } from "@/lib/storage/video";

export const runtime = "nodejs";

const schema = z.object({
  key: z.string().min(3),
  publicUrl: z.string().min(3),
});

/** Après PUT R2 réussi : lie la vidéo au profil talent. */
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    if (!body.key.startsWith("presentations/")) {
      return NextResponse.json({ ok: false, error: "Clé invalide" }, { status: 400 });
    }

    const session = await getSession();
    if (session?.role === "TALENT") {
      const profile = await db.talentProfile.findUnique({
        where: { userId: session.id },
        select: { presentationVideoKey: true },
      });
      const previousKey = profile?.presentationVideoKey || undefined;

      await db.user.update({
        where: { id: session.id },
        data: {
          talentProfile: {
            upsert: {
              create: {
                showreelUrl: body.publicUrl,
                presentationVideoKey: body.key,
              },
              update: {
                showreelUrl: body.publicUrl,
                presentationVideoKey: body.key,
              },
            },
          },
        },
      });

      if (previousKey && previousKey !== body.key) {
        await deleteStoredVideo(previousKey);
      }
    }

    return NextResponse.json({
      ok: true,
      url: body.publicUrl,
      key: body.key,
      provider: "r2",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
