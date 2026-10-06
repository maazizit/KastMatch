import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { getParticipantConversation } from "@/lib/messaging";

export const runtime = "nodejs";

/** Messages du fil — marque comme lus ceux reçus. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const convo = await getParticipantConversation(id, session.id);

    await db.message.updateMany({
      where: { conversationId: id, senderId: { not: session.id }, readAt: null },
      data: { readAt: new Date() },
    });

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 300,
      select: { id: true, senderId: true, body: true, createdAt: true, readAt: true },
    });

    return NextResponse.json({
      ok: true,
      conversation: {
        id: convo.id,
        castingHint: convo.castingHint,
        other: session.id === convo.directorId ? convo.talent : convo.director,
      },
      me: session.id,
      messages,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
