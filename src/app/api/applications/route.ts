import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";

const applySchema = z.object({
  castingId: z.string().min(1),
  coverNote: z.string().optional(),
});

const statusSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(["PENDING", "SHORTLISTED", "REJECTED", "BOOKED"]),
});

export async function GET() {
  try {
    const session = await requireSession();
    if (session.role === "TALENT") {
      const applications = await db.application.findMany({
        where: { talentId: session.id },
        orderBy: { createdAt: "desc" },
        include: {
          casting: {
            include: { director: { select: { name: true } } },
          },
        },
      });
      return NextResponse.json({ ok: true, applications });
    }
    const applications = await db.application.findMany({
      where: { casting: { directorId: session.id } },
      orderBy: { createdAt: "desc" },
      include: {
        casting: { select: { id: true, title: true, role: true } },
        talent: {
          select: {
            id: true,
            name: true,
            email: true,
            talentProfile: true,
            portfolioPhotos: {
              orderBy: { position: "asc" },
              take: 5,
              select: { id: true, url: true },
            },
          },
        },
      },
    });
    return NextResponse.json({ ok: true, applications });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const talent = await requireSession("TALENT");
    const body = applySchema.parse(await request.json());
    const casting = await db.casting.findFirst({
      where: { id: body.castingId, isOpen: true },
    });
    if (!casting) {
      return NextResponse.json(
        { ok: false, error: "Casting introuvable ou fermé" },
        { status: 404 },
      );
    }
    const application = await db.application.upsert({
      where: {
        castingId_talentId: {
          castingId: body.castingId,
          talentId: talent.id,
        },
      },
      create: {
        castingId: body.castingId,
        talentId: talent.id,
        coverNote: body.coverNote ?? "",
      },
      update: {
        coverNote: body.coverNote ?? "",
      },
    });
    return NextResponse.json({ ok: true, application }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const director = await requireSession("DIRECTOR");
    const body = statusSchema.parse(await request.json());
    const existing = await db.application.findFirst({
      where: {
        id: body.applicationId,
        casting: { directorId: director.id },
      },
    });
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Candidature introuvable" },
        { status: 404 },
      );
    }
    const application = await db.application.update({
      where: { id: body.applicationId },
      data: { status: body.status },
    });
    return NextResponse.json({ ok: true, application });
  } catch (error) {
    return toErrorResponse(error);
  }
}
