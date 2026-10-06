import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

/** Nombre de messages non lus (pastille de la navigation). 0 si non connecté. */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: true, count: 0 });
    const count = await db.message.count({
      where: {
        readAt: null,
        senderId: { not: session.id },
        conversation:
          session.role === "DIRECTOR"
            ? { directorId: session.id }
            : { talentId: session.id },
      },
    });
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    return toErrorResponse(error);
  }
}
