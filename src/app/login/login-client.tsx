"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { fetchMe, loginRequest } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (me) {
        const next = searchParams.get("next");
        if (next && next.startsWith("/") && !next.startsWith("//")) {
          router.replace(next);
        } else {
          router.replace(me.role === "DIRECTOR" ? "/director" : "/talent/agents");
        }
        return;
      }
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await loginRequest(email, password);
      const next = searchParams.get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        router.push(next);
      } else {
        router.push(user.role === "DIRECTOR" ? "/director" : "/talent/agents");
      }
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
      className="mt-8 space-y-4 rounded-2xl border border-frame bg-white p-6 shadow-sm"
      noValidate
    >
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
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
          placeholder="••••••••"
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
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

export function LoginClient() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl text-mist">Connexion</h1>
        <p className="mt-2 text-sm text-mist-dim">
          Accède à ton espace talent ou réalisateur.
        </p>
        <Suspense fallback={<p className="mt-8 text-mist-dim">Chargement…</p>}>
          <LoginForm />
        </Suspense>
        <p className="mt-4 text-sm text-mist-dim">
          Pas de compte ?{" "}
          <Link href="/register" className="font-semibold text-spot">
            Créer un compte
          </Link>
        </p>
        <p className="mt-3 text-xs text-mist-dim">
          Demo : talent@kastmatch.app / director@kastmatch.app — mot de passe{" "}
          <span className="font-semibold text-mist">kastmatch123</span>
        </p>
      </main>
    </div>
  );
}
