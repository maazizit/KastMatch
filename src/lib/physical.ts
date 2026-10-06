/** Description physique du talent — champs structurés pour filtres & matching IA. */

export const GENDER_OPTIONS = [
  { value: "", label: "—" },
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "non-binaire", label: "Non-binaire" },
] as const;

export const BUILD_OPTIONS = [
  { value: "", label: "—" },
  { value: "mince", label: "Mince" },
  { value: "athletique", label: "Athlétique" },
  { value: "moyenne", label: "Moyenne" },
  { value: "forte", label: "Forte" },
] as const;

export const HAIR_OPTIONS = [
  { value: "", label: "—" },
  { value: "noir", label: "Noirs" },
  { value: "brun", label: "Bruns" },
  { value: "chatain", label: "Châtains" },
  { value: "blond", label: "Blonds" },
  { value: "roux", label: "Roux" },
  { value: "gris", label: "Gris / blancs" },
  { value: "chauve", label: "Chauve / rasé" },
] as const;

export const EYE_OPTIONS = [
  { value: "", label: "—" },
  { value: "noirs", label: "Noirs" },
  { value: "marron", label: "Marron" },
  { value: "noisette", label: "Noisette" },
  { value: "verts", label: "Verts" },
  { value: "bleus", label: "Bleus" },
  { value: "gris", label: "Gris" },
] as const;

export type PhysicalProfile = {
  gender: string;
  ageMin: string; // âge de jeu — string pour les inputs
  ageMax: string;
  heightCm: string;
  build: string;
  hairColor: string;
  eyeColor: string;
  appearance: string;
  distinctFeatures: string;
  physicalDescription: string;
};

export const emptyPhysical: PhysicalProfile = {
  gender: "",
  ageMin: "",
  ageMax: "",
  heightCm: "",
  build: "",
  hairColor: "",
  eyeColor: "",
  appearance: "",
  distinctFeatures: "",
  physicalDescription: "",
};

const labelOf = (opts: readonly { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? v;

export const genderLabel = (v: string) => labelOf(GENDER_OPTIONS, v);
export const buildLabel = (v: string) => labelOf(BUILD_OPTIONS, v);
export const hairLabel = (v: string) => labelOf(HAIR_OPTIONS, v);
export const eyeLabel = (v: string) => labelOf(EYE_OPTIONS, v);

/** Nombre de champs physiques remplis (hors apparence, optionnelle). */
export function physicalFilled(p: PhysicalProfile): { filled: number; total: number } {
  const fields = [
    p.gender,
    p.ageMin || p.ageMax,
    p.heightCm,
    p.build,
    p.hairColor,
    p.eyeColor,
    p.physicalDescription,
  ];
  return { filled: fields.filter((f) => String(f).trim() !== "").length, total: fields.length };
}

export function toIntOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export function playingAgeLabel(min?: number | null, max?: number | null) {
  if (min && max) return `${min}–${max} ans`;
  if (min) return `${min}+ ans`;
  if (max) return `jusqu'à ${max} ans`;
  return "";
}
