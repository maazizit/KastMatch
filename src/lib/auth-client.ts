export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "TALENT" | "DIRECTOR";
  talentProfile?: unknown;
};

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user ?? null;
}

export async function loginRequest(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Connexion échouée");
  return data.user as AuthUser;
}

export async function registerRequest(input: {
  email: string;
  password: string;
  name: string;
  role: "TALENT" | "DIRECTOR";
}) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Inscription échouée");
  return data.user as AuthUser;
}

export async function logoutRequest() {
  await fetch("/api/auth/logout", { method: "POST" });
}
