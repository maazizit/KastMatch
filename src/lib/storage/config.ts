/** Cloudflare R2 (S3-compatible) — serveur uniquement. */

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

export function r2Endpoint() {
  const accountId = process.env.R2_ACCOUNT_ID;
  if (!accountId) throw new Error("R2_ACCOUNT_ID manquant");
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

/** Public base URL for objects (custom domain ou r2.dev). */
export function r2PublicBaseUrl() {
  return (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
}
