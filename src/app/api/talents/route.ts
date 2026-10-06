import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PORTFOLIO_LIMITS } from "@/lib/storage/limits";
import { toErrorResponse } from "@/lib/api-error";

/** Liste talents visibles par les réalisateurs (profils publics minimaux). */
export async function GET() {
  try {
    await requireSession("DIRECTOR");
    const talents = await db.user.findMany({
      where: { role: "TALENT" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        talentProfile: true,
        portfolioPhotos: {
          orderBy: { position: "asc" },
          take: PORTFOLIO_LIMITS.maxPhotos,
          select: { id: true, url: true },
        },
      },
    });
    return NextResponse.json({ ok: true, talents });
  } catch (error) {
    return toErrorResponse(error);
  }
}
