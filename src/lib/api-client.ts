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
  email?: string;
  talentProfile: {
    city: string;
    roles: string;
    languages: string;
    tagline: string;
    bio: string;
    phone?: string;
    gender?: string;
    ageMin?: number | null;
    ageMax?: number | null;
    heightCm?: number | null;
    build?: string;
    hairColor?: string;
    eyeColor?: string;
    appearance?: string;
    distinctFeatures?: string;
    physicalDescription?: string;
    showreelUrl: string;
    photoUrl: string;
    availability: "AVAILABLE" | "LIMITED" | "BOOKED";
  } | null;
  portfolioPhotos?: PortfolioPhoto[];
};

export type PortfolioPhoto = { id: string; url: string };

export type ApiProfile = {
  city: string;
  roles: string;
  languages: string;
  tagline: string;
  bio: string;
  phone?: string;
  gender?: string;
  ageMin?: number | null;
  ageMax?: number | null;
  heightCm?: number | null;
  build?: string;
  hairColor?: string;
  eyeColor?: string;
  appearance?: string;
  distinctFeatures?: string;
  physicalDescription?: string;
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
    bio: p?.bio || undefined,
    availability,
    showreelUrl: p?.showreelUrl || undefined,
    photos: t.portfolioPhotos?.map((ph) => ph.url) ?? [],
    email: t.email || undefined,
    phone: p?.phone || undefined,
    physical: p
      ? {
          gender: p.gender ?? "",
          ageMin: p.ageMin ?? null,
          ageMax: p.ageMax ?? null,
          heightCm: p.heightCm ?? null,
          build: p.build ?? "",
          hairColor: p.hairColor ?? "",
          eyeColor: p.eyeColor ?? "",
          appearance: p.appearance ?? "",
          distinctFeatures: p.distinctFeatures ?? "",
          physicalDescription: p.physicalDescription ?? "",
        }
      : undefined,
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
      portfolioPhotos?: PortfolioPhoto[];
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
  phone?: string;
  gender?: string;
  ageMin?: number | null;
  ageMax?: number | null;
  heightCm?: number | null;
  build?: string;
  hairColor?: string;
  eyeColor?: string;
  appearance?: string;
  distinctFeatures?: string;
  physicalDescription?: string;
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

export async function apiGetPortfolio(): Promise<PortfolioPhoto[]> {
  const res = await fetch("/api/portfolio", { cache: "no-store" });
  const data = await parseJson(res);
  return data.photos as PortfolioPhoto[];
}

export async function apiUploadPortfolioPhoto(file: Blob): Promise<PortfolioPhoto> {
  const form = new FormData();
  form.append("photo", file, "photo");
  const res = await fetch("/api/portfolio", { method: "POST", body: form });
  const data = await parseJson(res);
  return data.photo as PortfolioPhoto;
}

export async function apiDeletePortfolioPhoto(id: string) {
  const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
  return parseJson(res);
}

export type ConversationSummary = {
  id: string;
  other: { id: string; name: string };
  castingHint: string;
  lastMessage: { body: string; fromMe: boolean; createdAt: string } | null;
  unread: number;
  lastMessageAt: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export async function apiGetConversations(): Promise<ConversationSummary[]> {
  const res = await fetch("/api/conversations", { cache: "no-store" });
  const data = await parseJson(res);
  return data.conversations as ConversationSummary[];
}

export async function apiGetConversation(id: string) {
  const res = await fetch(`/api/conversations/${id}`, { cache: "no-store" });
  const data = await parseJson(res);
  return data as {
    conversation: { id: string; castingHint: string; other: { id: string; name: string } };
    me: string;
    messages: ChatMessage[];
  };
}

export async function apiStartConversation(input: {
  talentId: string;
  body: string;
  castingHint?: string;
}): Promise<string> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(res);
  return data.conversationId as string;
}

export async function apiSendMessage(conversationId: string, body: string): Promise<ChatMessage> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  const data = await parseJson(res);
  return data.message as ChatMessage;
}

export async function apiGetUnreadCount(): Promise<number> {
  const res = await fetch("/api/messages/unread", { cache: "no-store" });
  const data = await parseJson(res);
  return data.count as number;
}

export type CharacterSheet = {
  title: string;
  summary: string;
  gender: string;
  ageMin: number | null;
  ageMax: number | null;
  heightMin: number | null;
  heightMax: number | null;
  builds: string[];
  hair: string[];
  eyes: string[];
  languages: string[];
  roles: string[];
  traits: string[];
  voice: string;
};

export type AiMatchRow = {
  id: string;
  name: string;
  city: string;
  tagline: string;
  photo: string | null;
  structuredScore: number;
  score: number;
  reason: string;
  strengths: string[];
  risks: string[];
};

export type AiCompareResult = {
  talents: { id: string; name: string; fit: number; strengths: string[]; risks: string[] }[];
  recommendation: string;
  differentiators: string[];
};

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson(res);
}

export async function apiAiBrief(brief: string): Promise<CharacterSheet> {
  const data = await postJson("/api/ai/director/brief", { brief });
  return data.sheet as CharacterSheet;
}

export async function apiAiMatch(brief: string, sheet: CharacterSheet) {
  const data = await postJson("/api/ai/director/match", { brief, sheet });
  return data as { results: AiMatchRow[]; aiUsed: boolean; totalTalents: number };
}

export async function apiAiCompare(
  brief: string,
  sheet: CharacterSheet,
  talentIds: string[],
): Promise<AiCompareResult> {
  const data = await postJson("/api/ai/director/compare", { brief, sheet, talentIds });
  return data as unknown as AiCompareResult;
}
