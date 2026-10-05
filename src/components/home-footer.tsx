"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMe, type AuthUser } from "@/lib/auth-client";

export function HomeFooter() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void fetchMe().then(setUser);
  }, []);

  return (
    <footer className="border-t border-frame bg-ink-elevated px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-xs tracking-[0.25em] text-mist-dim uppercase sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-mist normal-case tracking-normal">
          Kast<span className="text-spot">Match</span>
        </p>
        <nav className="flex flex-wrap gap-4 normal-case tracking-normal">
          {user ? (
            <>
              <Link
                href={user.role === "DIRECTOR" ? "/director" : "/talent/agents"}
                className="hover:text-spot"
              >
                Mon espace
              </Link>
              <Link
                href={user.role === "DIRECTOR" ? "/director" : "/talent/profil"}
                className="hover:text-spot"
              >
                {user.role === "DIRECTOR" ? "Castings" : "Mon profil"}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-spot">
                Connexion
              </Link>
              <Link href="/register" className="hover:text-spot">
                Inscription
              </Link>
              <Link href="/register?role=TALENT" className="hover:text-spot">
                Talent
              </Link>
              <Link href="/register?role=DIRECTOR" className="hover:text-spot">
                Réalisateur
              </Link>
            </>
          )}
        </nav>
        <p>Casting · Cinema · Private beta</p>
      </div>
    </footer>
  );
}
