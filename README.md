# KastMatch

Matching **réalisateurs ↔ talents** pour le cinéma, la pub et les productions.

Brand séparée de MoroMatch. Repo privé.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (hero, reel, roles)
- Lucide icons

## Design

Direction **cinema set** : encre profonde, tungsten (`spot`), light-leak, film grain, strip de frames animé. Typo **Syne** (display) + **DM Sans** (body).

## Routes MVP

| Route | Rôle |
|-------|------|
| `/` | Landing cinema + badge AI-Powered |
| `/talent` | Castings ouverts + postuler (mock) |
| `/talent/profil` | Espace perso talent |
| `/director/dashboard` | Dashboard casting IA (scores, analyse) |
| `/director` | Publier casting + shortlist (mock) |

## Dev

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

