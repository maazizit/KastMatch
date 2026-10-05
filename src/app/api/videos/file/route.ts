import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/api-error";
import { getR2Object } from "@/lib/storage/video";
import { isR2Configured } from "@/lib/storage/config";

export const runtime = "nodejs";

/** Proxy lecture R2 quand pas de domaine public. */
export async function GET(request: Request) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { ok: false, error: "R2 non configuré" },
        { status: 404 },
      );
    }
    const key = new URL(request.url).searchParams.get("key");
    if (!key || (!key.startsWith("presentations/") && !key.startsWith("portfolio/"))) {
      return NextResponse.json({ ok: false, error: "Clé invalide" }, { status: 400 });
    }

    const obj = await getR2Object(key);
    const body = obj.Body;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
    }

    const bytes = await body.transformToByteArray();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": obj.ContentType ?? "video/webm",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
