import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { ZodError } from "zod";

export function toErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { ok: false, error: error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }
  const message = error instanceof Error ? error.message : "Erreur serveur";
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
