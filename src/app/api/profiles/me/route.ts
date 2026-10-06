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
  phone: z.string().max(40).optional(),
  showreelUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  availability: z.enum(["AVAILABLE", "LIMITED", "BOOKED"]).optional(),
  gender: z.string().max(20).optional(),
  ageMin: z.number().int().min(5).max(99).nullable().optional(),
  ageMax: z.number().int().min(5).max(99).nullable().optional(),
  heightCm: z.number().int().min(100).max(230).nullable().optional(),
  build: z.string().max(20).optional(),
  hairColor: z.string().max(20).optional(),
  eyeColor: z.string().max(20).optional(),
  appearance: z.string().max(120).optional(),
  distinctFeatures: z.string().max(300).optional(),
  physicalDescription: z.string().max(1000).optional(),
});

const PHYSICAL_KEYS = [
  "gender",
  "ageMin",
  "ageMax",
  "heightCm",
  "build",
  "hairColor",
  "eyeColor",
  "appearance",
  "distinctFeatures",
  "physicalDescription",
] as const;

function physicalCreate(body: z.infer<typeof updateSchema>) {
  return {
    gender: body.gender ?? "",
    ageMin: body.ageMin ?? null,
    ageMax: body.ageMax ?? null,
    heightCm: body.heightCm ?? null,
    build: body.build ?? "",
    hairColor: body.hairColor ?? "",
    eyeColor: body.eyeColor ?? "",
    appearance: body.appearance ?? "",
    distinctFeatures: body.distinctFeatures ?? "",
    physicalDescription: body.physicalDescription ?? "",
  };
}

function physicalUpdate(body: z.infer<typeof updateSchema>) {
  const out: Record<string, unknown> = {};
  for (const key of PHYSICAL_KEYS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

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
              phone: body.phone ?? "",
              showreelUrl: body.showreelUrl ?? "",
              photoUrl: body.photoUrl ?? "",
              availability: body.availability ?? "AVAILABLE",
              ...physicalCreate(body),
            },
            update: {
              ...(body.city !== undefined ? { city: body.city } : {}),
              ...(body.roles !== undefined ? { roles: body.roles } : {}),
              ...(body.languages !== undefined ? { languages: body.languages } : {}),
              ...(body.tagline !== undefined ? { tagline: body.tagline } : {}),
              ...(body.bio !== undefined ? { bio: body.bio } : {}),
              ...(body.phone !== undefined ? { phone: body.phone } : {}),
              ...(body.showreelUrl !== undefined
                ? { showreelUrl: body.showreelUrl }
                : {}),
              ...(body.photoUrl !== undefined ? { photoUrl: body.photoUrl } : {}),
              ...(body.availability !== undefined
                ? { availability: body.availability }
                : {}),
              ...physicalUpdate(body),
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
