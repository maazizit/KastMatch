import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-error";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await loginUser(body);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
