import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-error";
import { isR2Configured, r2Endpoint, r2PublicBaseUrl } from "@/lib/storage/config";
import { VIDEO_LIMITS } from "@/lib/storage/limits";

export const runtime = "nodejs";

/** URL présignée PUT → upload direct navigateur → R2 (évite la limite body Next/Vercel). */
export async function POST(request: Request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          ok: false,
          error: "R2 non configuré",
          fallback: "multipart",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      contentType?: string;
    };
    const contentType = body.contentType || "video/webm";
    if (!contentType.startsWith("video/")) {
      return NextResponse.json(
        { ok: false, error: "Format vidéo non supporté" },
        { status: 400 },
      );
    }

    const session = await getSession();
    const ownerId = session?.id ?? `guest-${randomUUID().slice(0, 8)}`;
    const ext = contentType.includes("mp4")
      ? "mp4"
      : contentType.includes("quicktime")
        ? "mov"
        : "webm";
    const key = `presentations/${ownerId}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    const client = new S3Client({
      region: "auto",
      endpoint: r2Endpoint(),
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

    const base = r2PublicBaseUrl();
    const publicUrl = base
      ? `${base}/${key}`
      : `/api/videos/file?key=${encodeURIComponent(key)}`;

    return NextResponse.json({
      ok: true,
      uploadUrl,
      key,
      publicUrl,
      maxBytes: VIDEO_LIMITS.maxBytes,
      maxDurationSec: VIDEO_LIMITS.maxDurationSec,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
