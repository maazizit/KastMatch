"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { fetchMe, registerRequest } from "@/lib/auth-client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole =
    roleParam === "DIRECTOR" || roleParam === "director"
      ? "DIRECTOR"
      : "TALENT";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TALENT" | "DIRECTOR">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (me) {
        router.replace(me.role === "DIRECTOR" ? "/director" : "/talent/agents");
        return;
      }
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await registerRequest({ name, email, password, role });
      router.push(user.role === "DIRECTOR" ? "/director" : "/talent/profil");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <p className="mt-8 text-sm text-mist-dim" role="status">
        Vérification de session…
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 space-y-4 rounded-2xl border border-frame bg-ink-elevated p-6 shadow-sm"
      noValidate
    >
      <div className="flex gap-2" role="group" aria-label="Type de compte">
        {(
          [
            ["TALENT", "Je suis talent"],
            ["DIRECTOR", "Je recrute"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            aria-pressed={role === value}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ${
              role === value
                ? "bg-spot text-white"
                : "border border-frame text-mist"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
        Nom
        <input
          required
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
          placeholder="Prénom Nom"
        />
      </label>
      <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
          placeholder="toi@email.com"
        />
      </label>
      <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
        Mot de passe
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
          placeholder="8 caractères min."
        />
      </label>
      {error && (
        <p className="text-sm text-spot" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-spot py-3 text-sm font-semibold text-white hover:bg-[var(--spot-hover)] disabled:opacity-60"
      >
        {loading ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}

export function RegisterClient() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl text-mist">Créer un compte</h1>
        <p className="mt-2 text-sm text-mist-dim">
          Inscription talent ou réalisateur — tes données sont en base.
        </p>
        <Suspense fallback={<p className="mt-8 text-mist-dim">Chargement…</p>}>
          <RegisterForm />
        </Suspense>
        <p className="mt-4 text-sm text-mist-dim">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-semibold text-spot">
            Se connecter
          </Link>
        </p>
      </main>
    </div>
  );
}
