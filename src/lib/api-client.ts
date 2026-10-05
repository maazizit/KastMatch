import type { AuthUser } from "./auth-client";
import type { Casting, Talent } from "./types";

export type ApiCasting = {
  id: string;
  title: string;
  production: string;
  city: string;
  role: string;
  shootDates: string;
  paid: boolean;
  summary: string;
  isOpen: boolean;
  director?: { id: string; name: string };
  applications?: { id: string; status: string }[];
  _count?: { applications: number };
};

export type ApiTalent = {
  id: string;
  name: string;
  talentProfile: {
    city: string;
    roles: string;
    languages: string;
    tagline: string;
    bio: string;
    showreelUrl: string;
    photoUrl: string;
    availability: "AVAILABLE" | "LIMITED" | "BOOKED";
  } | null;
};

export type ApiProfile = {
  city: string;
  roles: string;
  languages: string;
  tagline: string;
  bio: string;
  showreelUrl: string;
  photoUrl: string;
  availability: "AVAILABLE" | "LIMITED" | "BOOKED";
  presentationVideoKey?: string;
};

function splitCsv(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function mapCasting(c: ApiCasting): Casting {
  return {
    id: c.id,
    title: c.title,
    production: c.production,
    city: c.city,
    role: c.role,
    shootDates: c.shootDates,
    paid: c.paid,
    director: c.director?.name ?? "Réalisateur",
    summary: c.summary,
  };
}

export function mapTalent(t: ApiTalent): Talent {
  const p = t.talentProfile;
  const availability =
    p?.availability === "LIMITED"
      ? "limited"
      : p?.availability === "BOOKED"
        ? "booked"
        : "available";
  return {
    id: t.id,
    name: t.name,
    city: p?.city || "",
    roles: splitCsv(p?.roles || ""),
    languages: splitCsv(p?.languages || ""),
    tagline: p?.tagline || "",
    availability,
    showreelUrl: p?.showreelUrl || undefined,
  };
}

export function availabilityToApi(
  value: "available" | "limited" | "booked",
): ApiProfile["availability"] {
  if (value === "limited") return "LIMITED";
  if (value === "booked") return "BOOKED";
  return "AVAILABLE";
}

export function availabilityFromApi(
  value: ApiProfile["availability"] | undefined,
): "available" | "limited" | "booked" {
  if (value === "LIMITED") return "limited";
  if (value === "BOOKED") return "booked";
  return "available";
}

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

export async function apiGetCastings(mine = false): Promise<ApiCasting[]> {
  const res = await fetch(`/api/castings${mine ? "?mine=1" : ""}`, {
    cache: "no-store",
  });
  const data = await parseJson(res);
  return data.castings as ApiCasting[];
}

export async function apiCreateCasting(input: {
  title: string;
  production?: string;
  city?: string;
  role: string;
  shootDates?: string;
  paid?: boolean;
  summary: string;
}): Promise<ApiCasting> {
  const res = await fetch("/api/castings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(res);
  return data.casting as ApiCasting;
}

export async function apiApply(castingId: string, coverNote = "") {
  const res = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ castingId, coverNote }),
  });
  return parseJson(res);
}

export async function apiGetApplications() {
  const res = await fetch("/api/applications", { cache: "no-store" });
  const data = await parseJson(res);
  return data.applications as Array<{
    id: string;
    status: string;
    coverNote: string;
    casting: { id: string; title: string; role: string };
    talent?: {
      id: string;
      name: string;
      email: string;
      talentProfile: ApiProfile | null;
    };
  }>;
}

export async function apiUpdateApplicationStatus(
  applicationId: string,
  status: "PENDING" | "SHORTLISTED" | "REJECTED" | "BOOKED",
) {
  const res = await fetch("/api/applications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applicationId, status }),
  });
  return parseJson(res);
}

export async function apiGetTalents(): Promise<ApiTalent[]> {
  const res = await fetch("/api/talents", { cache: "no-store" });
  const data = await parseJson(res);
  return data.talents as ApiTalent[];
}

export async function apiGetMyProfile(): Promise<{
  user: AuthUser & { talentProfile: ApiProfile | null };
}> {
  const res = await fetch("/api/profiles/me", { cache: "no-store" });
  const data = await parseJson(res);
  return data as { user: AuthUser & { talentProfile: ApiProfile | null } };
}

export async function apiUpdateMyProfile(input: {
  name?: string;
  city?: string;
  roles?: string;
  languages?: string;
  tagline?: string;
  bio?: string;
  showreelUrl?: string;
  photoUrl?: string;
  availability?: ApiProfile["availability"];
}) {
  const res = await fetch("/api/profiles/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(res);
}
