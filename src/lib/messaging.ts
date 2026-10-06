import { z } from "zod";
import { AuthError } from "./auth";
import { db } from "./db";

import { MESSAGE_MAX_LENGTH } from "./messaging-shared";
const RATE_LIMIT_PER_MINUTE = 20;

export const messageBody = z
  .string()
  .trim()
  .min(1, "Message vide")
  .max(MESSAGE_MAX_LENGTH, `Message trop long (max ${MESSAGE_MAX_LENGTH} caractères)`);

/** Anti-spam simple : max 20 messages / minute / utilisateur. */
export async function assertRateLimit(userId: string) {
  const since = new Date(Date.now() - 60_000);
  const recent = await db.message.count({
    where: { senderId: userId, createdAt: { gte: since } },
  });
  if (recent >= RATE_LIMIT_PER_MINUTE) {
    throw new AuthError("Trop de messages envoyés, réessaie dans une minute", 429);
  }
}

/** Charge la conversation si l'utilisateur en est un des deux participants. */
export async function getParticipantConversation(id: string, userId: string) {
  const convo = await db.conversation.findUnique({
    where: { id },
    include: {
      director: { select: { id: true, name: true } },
      talent: { select: { id: true, name: true } },
    },
  });
  if (!convo || (convo.directorId !== userId && convo.talentId !== userId)) {
    throw new AuthError("Conversation introuvable", 404);
  }
  return convo;
}
