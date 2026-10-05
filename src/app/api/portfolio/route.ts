import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { PORTFOLIO_LIMITS } from "@/lib/storage/limits";
import { deletePortfolioPhoto, storePortfolioPhoto } from "@/lib/storage/photo";

export const runtime = "nodejs";

const select = { id: true, url: true } as const;

/** Mes photos de portfolio. */
export async function GET() {
  try {
    const session = await requireSession("TALENT");
    const photos = await db.portfolioPhoto.findMany({
      where: { userId: session.id },
      orderBy: { position: "asc" },
      select,
    });
    return NextResponse.json({ ok: true, photos, max: PORTFOLIO_LIMITS.maxPhotos });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Ajoute une photo (max 5 par talent, vérifié côté serveur). */
export async function POST(request: Request) {
  try {
    const session = await requireSession("TALENT");

    const form = await request.formData();
    const file = form.get("photo");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Fichier photo manquant" }, { status: 400 });
    }
    if (!(PORTFOLIO_LIMITS.allowedTypes as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Format image non supporté (JPEG, PNG ou WebP)" },
        { status: 400 },
      );
    }
    if (file.size > PORTFOLIO_LIMITS.maxBytes) {
      return NextResponse.json({ ok: false, error: "Photo trop lourde (max 4 Mo)" }, { status: 413 });
    }

    const count = await db.portfolioPhoto.count({ where: { userId: session.id } });
    if (count >= PORTFOLIO_LIMITS.maxPhotos) {
      return NextResponse.json(
        { ok: false, error: `Maximum ${PORTFOLIO_LIMITS.maxPhotos} photos — supprime-en une d’abord` },
        { status: 409 },
      );
    }

    const stored = await storePortfolioPhoto({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      ownerId: session.id,
    });

    const photo = await db.portfolioPhoto.create({
      data: {
        userId: session.id,
        key: stored.key,
        url: stored.url,
        contentType: file.type,
        sizeBytes: file.size,
        position: count,
      },
      select,
    });

    // Course (deux uploads simultanés) : on re-vérifie le quota après insertion.
    const after = await db.portfolioPhoto.count({ where: { userId: session.id } });
    if (after > PORTFOLIO_LIMITS.maxPhotos) {
      await db.portfolioPhoto.delete({ where: { id: photo.id } });
      await deletePortfolioPhoto(stored.key);
      return NextResponse.json(
        { ok: false, error: `Maximum ${PORTFOLIO_LIMITS.maxPhotos} photos atteint` },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true, photo });
  } catch (error) {
    return toErrorResponse(error);
  }
}
