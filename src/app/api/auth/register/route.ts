import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-error";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Mot de passe: 8 caractères minimum"),
  name: z.string().min(2),
  role: z.enum(["TALENT", "DIRECTOR"]),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await registerUser(body);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
