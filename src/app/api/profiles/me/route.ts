import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  city: z.string().optional(),
  roles: z.string().optional(),
  languages: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  showreelUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  availability: z.enum(["AVAILABLE", "LIMITED", "BOOKED"]).optional(),
});

export async function GET() {
  try {
    const session = await requireSession("TALENT");
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        talentProfile: true,
      },
    });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession("TALENT");
    const body = updateSchema.parse(await request.json());
    const user = await db.user.update({
      where: { id: session.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        talentProfile: {
          upsert: {
            create: {
              city: body.city ?? "",
              roles: body.roles ?? "",
              languages: body.languages ?? "",
              tagline: body.tagline ?? "",
              bio: body.bio ?? "",
              showreelUrl: body.showreelUrl ?? "",
              photoUrl: body.photoUrl ?? "",
              availability: body.availability ?? "AVAILABLE",
            },
            update: {
              ...(body.city !== undefined ? { city: body.city } : {}),
              ...(body.roles !== undefined ? { roles: body.roles } : {}),
              ...(body.languages !== undefined ? { languages: body.languages } : {}),
              ...(body.tagline !== undefined ? { tagline: body.tagline } : {}),
              ...(body.bio !== undefined ? { bio: body.bio } : {}),
              ...(body.showreelUrl !== undefined
                ? { showreelUrl: body.showreelUrl }
                : {}),
              ...(body.photoUrl !== undefined ? { photoUrl: body.photoUrl } : {}),
              ...(body.availability !== undefined
                ? { availability: body.availability }
                : {}),
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        talentProfile: true,
      },
    });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return toErrorResponse(error);
  }
}
