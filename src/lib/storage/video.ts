import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  isR2Configured,
  r2Endpoint,
  r2PublicBaseUrl,
} from "./config";
import { VIDEO_LIMITS } from "./limits";

function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: r2Endpoint(),
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function extFromMime(mime: string) {
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("quicktime")) return "mov";
  return "webm";
}

function assertVideo(contentType: string, byteLength: number) {
  if (byteLength > VIDEO_LIMITS.maxBytes) {
    throw new Error("Vidéo trop lourde (max 40 Mo)");
  }
  if (!contentType.startsWith("video/")) {
    throw new Error("Format vidéo non supporté");
  }
}

export type StoredVideo = {
  key: string;
  url: string;
  provider: "r2" | "local";
};

export async function storePresentationVideo(input: {
  buffer: Buffer;
  contentType: string;
  ownerId: string;
}): Promise<StoredVideo> {
  assertVideo(input.contentType, input.buffer.byteLength);

  const ext = extFromMime(input.contentType);
  const key = `presentations/${input.ownerId}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

  if (isR2Configured()) {
    const client = createR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: input.buffer,
        ContentType: input.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const base = r2PublicBaseUrl();
    const url = base
      ? `${base}/${key}`
      : `/api/videos/file?key=${encodeURIComponent(key)}`;
    return { key, url, provider: "r2" };
  }

  const fileName = key.replace(/\//g, "__");
  const dir = path.join(process.cwd(), "public", "uploads", "presentations");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), input.buffer);
  return {
    key: `local:${fileName}`,
    url: `/uploads/presentations/${fileName}`,
    provider: "local",
  };
}

export async function deleteStoredVideo(key: string | null | undefined) {
  if (!key) return;

  if (key.startsWith("local:")) {
    const fileName = key.slice("local:".length);
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "presentations",
      fileName,
    );
    try {
      await unlink(filePath);
    } catch {
      /* already gone */
    }
    return;
  }

  if (!isR2Configured()) return;
  const client = createR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }),
  );
}

export async function getR2Object(key: string) {
  if (!isR2Configured()) {
    throw new Error("R2 non configuré");
  }
  if (!key.startsWith("presentations/")) {
    throw new Error("Clé invalide");
  }
  const client = createR2Client();
  return client.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }),
  );
}
