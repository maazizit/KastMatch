/** Limites vidéo — safe côté client & serveur. */
export const VIDEO_LIMITS = {
  maxDurationSec: 90,
  maxBytes: 40 * 1024 * 1024, // 40 Mo
} as const;
