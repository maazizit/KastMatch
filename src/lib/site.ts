export const siteConfig = {
  name: "KastMatch",
  shortName: "KastMatch",
  tagline: "Le set trouve son talent.",
  description:
    "KastMatch relie réalisateurs et talents pour le cinéma, la pub et les productions. Matching IA, pitch vidéo, coach et shortlist.",
  locale: "fr_FR",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://kastmatch.app",
  keywords: [
    "casting",
    "cinéma",
    "réalisateur",
    "acteur",
    "talent",
    "matching IA",
    "castings",
    "production",
    "pub",
    "pitch vidéo",
    "KastMatch",
  ],
} as const;

export function absoluteUrl(path = "/") {
  const base = siteConfig.url;
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
