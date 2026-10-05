import { NextResponse } from "next/server";
import { aiIsConfigured, aiModelFor } from "@/lib/ai/config";

export async function GET() {
  return NextResponse.json({
    configured: aiIsConfigured(),
    models: {
      default: aiModelFor("default"),
      matching: aiModelFor("matching"),
      coach: aiModelFor("coach"),
      assessment: aiModelFor("assessment"),
    },
    providerBase: process.env.AI_API_BASE ? "configured" : null,
  });
}
