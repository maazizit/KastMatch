export type AiCandidate = {
  id: string;
  name: string;
  roleFit: string;
  city: string;
  photo: string;
  matchScore: number;
  analysis: {
    roleMatch: number;
    voice: number;
    microExpressions: number;
  };
  summary: string;
  tags: string[];
};

export const aiCandidates: AiCandidate[] = [
  {
    id: "ai1",
    name: "Salma Bennani",
    roleFit: "Lead · Drama",
    city: "Casablanca",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&q=80",
    matchScore: 94,
    analysis: {
      roleMatch: 96,
      voice: 91,
      microExpressions: 88,
    },
    summary:
      "Forte congruence émotionnelle avec le brief. Timing des silences aligné sur le ton intimiste du scénario.",
    tags: ["AR", "FR", "Close-up"],
  },
  {
    id: "ai2",
    name: "Youssef El Amrani",
    roleFit: "Supporting · Action",
    city: "Rabat",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&q=80",
    matchScore: 85,
    analysis: {
      roleMatch: 84,
      voice: 89,
      microExpressions: 78,
    },
    summary:
      "Bonne énergie physique et clarté d’intention. Score vocal élevé ; micro-expressions à travailler sur les plans serrés.",
    tags: ["AR", "FR", "EN"],
  },
  {
    id: "ai3",
    name: "Imane Chraibi",
    roleFit: "Lead · Comedy",
    city: "Marrakech",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop&q=80",
    matchScore: 72,
    analysis: {
      roleMatch: 70,
      voice: 76,
      microExpressions: 81,
    },
    summary:
      "Comédie naturelle détectée, mais écart partiel vs brief dramatique. Intéressante en alternative tonale.",
    tags: ["AR", "FR", "Impro"],
  },
];
