import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { toErrorResponse } from "@/lib/api-error";

const createSchema = z.object({
  title: z.string().min(2),
  production: z.string().optional(),
  city: z.string().optional(),
  role: z.string().min(2),
  shootDates: z.string().optional(),
  paid: z.boolean().optional(),
  summary: z.string().min(10),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";
    const session = await getSession();

    if (mine) {
      const director = await requireSession("DIRECTOR");
      const castings = await db.casting.findMany({
        where: { directorId: director.id },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { applications: true } },
        },
      });
      return NextResponse.json({ ok: true, castings });
    }

    const castings = await db.casting.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
      include: {
        director: { select: { id: true, name: true } },
        applications: session?.role === "TALENT"
          ? {
              where: { talentId: session.id },
              select: { id: true, status: true },
            }
          : false,
      },
    });
    return NextResponse.json({ ok: true, castings });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const director = await requireSession("DIRECTOR");
    const body = createSchema.parse(await request.json());
    const casting = await db.casting.create({
      data: {
        directorId: director.id,
        title: body.title,
        production: body.production ?? "",
        city: body.city ?? "",
        role: body.role,
        shootDates: body.shootDates ?? "",
        paid: body.paid ?? true,
        summary: body.summary,
      },
    });
    return NextResponse.json({ ok: true, casting }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
