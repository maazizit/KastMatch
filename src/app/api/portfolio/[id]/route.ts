import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { deletePortfolioPhoto } from "@/lib/storage/photo";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession("TALENT");
    const { id } = await params;
    const photo = await db.portfolioPhoto.findFirst({
      where: { id, userId: session.id },
      select: { id: true, key: true },
    });
    if (!photo) {
      return NextResponse.json({ ok: false, error: "Photo introuvable" }, { status: 404 });
    }
    await db.portfolioPhoto.delete({ where: { id: photo.id } });
    await deletePortfolioPhoto(photo.key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
