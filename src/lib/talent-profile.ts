import { emptyPhysical, physicalFilled, type PhysicalProfile } from "./physical";

export type TalentProfile = {
  name: string;
  city: string;
  roles: string;
  languages: string;
  tagline: string;
  bio: string;
  phone: string;
  showreelUrl: string;
  availability: "available" | "limited" | "booked";
} & PhysicalProfile;

export const defaultProfile: TalentProfile = {
  name: "",
  city: "Casablanca",
  roles: "Lead, Drama",
  languages: "AR, FR",
  tagline: "",
  bio: "",
  phone: "",
  showreelUrl: "",
  availability: "available",
  ...emptyPhysical,
};

const STORAGE_KEY = "kastmatch.talentProfile";

export function loadProfile(): TalentProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: TalentProfile) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function profileCompleteness(profile: TalentProfile): number {
  const fields = [
    profile.name,
    profile.city,
    profile.roles,
    profile.languages,
    profile.tagline,
    profile.bio,
    profile.phone,
    profile.showreelUrl,
  ];
  const physical = physicalFilled(profile);
  const filled =
    fields.filter((f) => f.trim().length > 0).length + physical.filled;
  return Math.round((filled / (fields.length + physical.total)) * 100);
}
