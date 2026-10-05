/** Limites vidéo — safe côté client & serveur. */
export const VIDEO_LIMITS = {
  maxDurationSec: 90,
  maxBytes: 40 * 1024 * 1024, // 40 Mo
} as const;

/** Portfolio photo — quota par talent pour maîtriser le stockage R2. */
export const PORTFOLIO_LIMITS = {
  maxPhotos: 5,
  maxBytes: 4 * 1024 * 1024, // 4 Mo (après compression client, ~300 Ko en pratique)
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;
