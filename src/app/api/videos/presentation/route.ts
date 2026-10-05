import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { VIDEO_LIMITS } from "@/lib/storage/limits";
import { deleteStoredVideo, storePresentationVideo } from "@/lib/storage/video";

export const runtime = "nodejs";

/** Upload vidéo présentation (webcam) → R2 ou disque local. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("video");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Fichier vidéo manquant" },
        { status: 400 },
      );
    }

    const session = await getSession();
    const ownerId = session?.id ?? `guest-${crypto.randomUUID().slice(0, 8)}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "video/webm";

    // Remplace l’ancienne vidéo si profil DB existant
    let previousKey: string | undefined;
    if (session?.role === "TALENT") {
      const profile = await db.talentProfile.findUnique({
        where: { userId: session.id },
        select: { presentationVideoKey: true },
      });
      previousKey = profile?.presentationVideoKey || undefined;
    }

    const stored = await storePresentationVideo({
      buffer,
      contentType,
      ownerId,
    });

    if (session?.role === "TALENT") {
      await db.user.update({
        where: { id: session.id },
        data: {
          talentProfile: {
            upsert: {
              create: {
                showreelUrl: stored.url,
                presentationVideoKey: stored.key,
              },
              update: {
                showreelUrl: stored.url,
                presentationVideoKey: stored.key,
              },
            },
          },
        },
      });
      if (previousKey && previousKey !== stored.key) {
        await deleteStoredVideo(previousKey);
      }
    }

    return NextResponse.json({
      ok: true,
      url: stored.url,
      key: stored.key,
      provider: stored.provider,
      maxDurationSec: VIDEO_LIMITS.maxDurationSec,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || session.role !== "TALENT") {
      return NextResponse.json(
        { ok: false, error: "Non authentifié" },
        { status: 401 },
      );
    }
    const profile = await db.talentProfile.findUnique({
      where: { userId: session.id },
      select: { presentationVideoKey: true },
    });
    await deleteStoredVideo(profile?.presentationVideoKey);
    await db.talentProfile.update({
      where: { userId: session.id },
      data: { showreelUrl: "", presentationVideoKey: "" },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
