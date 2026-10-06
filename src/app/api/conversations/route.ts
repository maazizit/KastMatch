import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";
import { assertRateLimit, messageBody } from "@/lib/messaging";

export const runtime = "nodejs";

/** Mes conversations (réalisateur ou talent), plus récentes d'abord. */
export async function GET() {
  try {
    const session = await requireSession();
    const mine =
      session.role === "DIRECTOR"
        ? { directorId: session.id }
        : { talentId: session.id };
    const rows = await db.conversation.findMany({
      where: mine,
      orderBy: { lastMessageAt: "desc" },
      include: {
        director: { select: { id: true, name: true } },
        talent: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: {
          select: {
            messages: { where: { readAt: null, senderId: { not: session.id } } },
          },
        },
      },
    });
    const conversations = rows.map((c) => ({
      id: c.id,
      other: session.role === "DIRECTOR" ? c.talent : c.director,
      castingHint: c.castingHint,
      lastMessage: c.messages[0]
        ? {
            body: c.messages[0].body,
            fromMe: c.messages[0].senderId === session.id,
            createdAt: c.messages[0].createdAt,
          }
        : null,
      unread: c._count.messages,
      lastMessageAt: c.lastMessageAt,
    }));
    return NextResponse.json({ ok: true, conversations });
  } catch (error) {
    return toErrorResponse(error);
  }
}

const createSchema = z.object({
  talentId: z.string().min(1),
  body: messageBody,
  castingHint: z.string().max(120).optional(),
});

/** Seul un réalisateur peut ouvrir une conversation (anti-spam côté talents). */
export async function POST(request: Request) {
  try {
    const session = await requireSession("DIRECTOR");
    const input = createSchema.parse(await request.json());

    const talent = await db.user.findFirst({
      where: { id: input.talentId, role: "TALENT" },
      select: { id: true },
    });
    if (!talent) throw new AuthError("Talent introuvable", 404);

    await assertRateLimit(session.id);

    const conversation = await db.conversation.upsert({
      where: {
        directorId_talentId: { directorId: session.id, talentId: talent.id },
      },
      create: {
        directorId: session.id,
        talentId: talent.id,
        castingHint: input.castingHint ?? "",
      },
      update: {
        lastMessageAt: new Date(),
        ...(input.castingHint ? { castingHint: input.castingHint } : {}),
      },
      select: { id: true },
    });

    await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.id,
        body: input.body,
      },
    });

    return NextResponse.json({ ok: true, conversationId: conversation.id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
