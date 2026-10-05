import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("kastmatch123", 12);

  const talent = await db.user.upsert({
    where: { email: "talent@kastmatch.app" },
    update: {},
    create: {
      email: "talent@kastmatch.app",
      passwordHash,
      name: "Salma Bennani",
      role: "TALENT",
      talentProfile: {
        create: {
          city: "Casablanca",
          roles: "Lead, Drama",
          languages: "AR, FR, EN",
          tagline: "Présence caméra intimiste, shorts & long métrage.",
          bio: "Comédienne formée, à l’aise en self-tape et plateau.",
          availability: "AVAILABLE",
        },
      },
    },
  });

  const director = await db.user.upsert({
    where: { email: "director@kastmatch.app" },
    update: {},
    create: {
      email: "director@kastmatch.app",
      passwordHash,
      name: "Hanae Mourad",
      role: "DIRECTOR",
    },
  });

  const existing = await db.casting.count({ where: { directorId: director.id } });
  if (existing === 0) {
    await db.casting.createMany({
      data: [
        {
          directorId: director.id,
          title: "Nuit Blanche — court métrage",
          production: "Atlas Frame",
          city: "Casablanca",
          role: "Lead féminin, 25–35",
          shootDates: "12–18 nov",
          paid: true,
          summary:
            "Drame nocturne. Besoin d’une présence contenue, peu de dialogues.",
        },
        {
          directorId: director.id,
          title: "Spot thé — chaleur",
          production: "Studio Lumen",
          city: "Rabat",
          role: "Couple 30–40",
          shootDates: "2 jours · oct",
          paid: true,
          summary:
            "Pub lifestyle. Ton chaleureux, improvisation légère bienvenue.",
        },
        {
          directorId: director.id,
          title: "Figuration marché",
          production: "Nord Prod",
          city: "Tanger",
          role: "Crowd / extras",
          shootDates: "weekend",
          paid: false,
          summary:
            "Scène de marché pour long métrage indé. Ambiance authentique.",
        },
      ],
    });
  }

  console.log("Seed OK");
  console.log("  talent@kastmatch.app / kastmatch123");
  console.log("  director@kastmatch.app / kastmatch123");
  console.log("  talent id:", talent.id);
  console.log("  director id:", director.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
