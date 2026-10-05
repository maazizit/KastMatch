import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { isR2Configured, r2PublicBaseUrl } from "./config";
import { PORTFOLIO_LIMITS } from "./limits";
import { createR2Client } from "./video";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type StoredPhoto = { key: string; url: string };

export async function storePortfolioPhoto(input: {
  buffer: Buffer;
  contentType: string;
  ownerId: string;
}): Promise<StoredPhoto> {
  const ext = EXT[input.contentType];
  if (!ext) throw new Error("Format image non supporté (JPEG, PNG ou WebP)");
  if (input.buffer.byteLength > PORTFOLIO_LIMITS.maxBytes) {
    throw new Error("Photo trop lourde (max 4 Mo)");
  }

  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const key = `portfolio/${input.ownerId}/${name}`;

  if (isR2Configured()) {
    await createR2Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const base = r2PublicBaseUrl();
    return {
      key,
      url: base ? `${base}/${key}` : `/api/videos/file?key=${encodeURIComponent(key)}`,
    };
  }

  // Dev local sans R2
  const fileName = key.replace(/\//g, "__");
  const dir = path.join(process.cwd(), "public", "uploads", "portfolio");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), input.buffer);
  return { key: `local:${fileName}`, url: `/uploads/portfolio/${fileName}` };
}

export async function deletePortfolioPhoto(key: string) {
  if (key.startsWith("local:")) {
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "portfolio",
      key.slice("local:".length),
    );
    await unlink(filePath).catch(() => {});
    return;
  }
  if (!isR2Configured()) return;
  await createR2Client().send(
    new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }),
  );
}
