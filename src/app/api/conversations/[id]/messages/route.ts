import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import {
  assertRateLimit,
  getParticipantConversation,
  messageBody,
} from "@/lib/messaging";

export const runtime = "nodejs";

const schema = z.object({ body: messageBody });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await getParticipantConversation(id, session.id);
    const { body } = schema.parse(await request.json());
    await assertRateLimit(session.id);

    const [message] = await db.$transaction([
      db.message.create({
        data: { conversationId: id, senderId: session.id, body },
        select: { id: true, senderId: true, body: true, createdAt: true, readAt: true },
      }),
      db.conversation.update({ where: { id }, data: { lastMessageAt: new Date() } }),
    ]);

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return toErrorResponse(error);
  }
}
