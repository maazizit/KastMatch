"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { AiBadge } from "./ai-badge";
import { fetchMe, logoutRequest, type AuthUser } from "@/lib/auth-client";

const publicLinks = [
  { href: "/", label: "Accueil" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void fetchMe().then(setUser);
  }, [pathname]);

  const links =
    user?.role === "DIRECTOR"
      ? [
          ...publicLinks,
          { href: "/director", label: "Castings" },
          { href: "/director/dashboard", label: "Dashboard IA" },
        ]
      : user?.role === "TALENT"
        ? [
            ...publicLinks,
            { href: "/talent", label: "Castings" },
            { href: "/talent/agents", label: "Agents" },
            { href: "/talent/profil", label: "Mon profil" },
          ]
        : [
            ...publicLinks,
            { href: "/talent", label: "Castings" },
            { href: "/director", label: "Réalisateur" },
          ];

  async function onLogout() {
    await logoutRequest();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="relative z-20 flex items-center justify-between gap-3 border-b border-frame bg-white/85 px-6 py-5 backdrop-blur-md md:px-12">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.28em] text-mist uppercase md:text-xl"
        >
          Kast<span className="text-spot">Match</span>
        </Link>
        <AiBadge className="hidden sm:inline-flex" />
      </div>
      <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs tracking-[0.2em] uppercase transition sm:px-4",
                active
                  ? "bg-spot/15 text-spot"
                  : "text-mist-dim hover:text-mist",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        {user ? (
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-full px-3 py-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase transition hover:text-spot sm:px-4"
          >
            Sortir
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase transition hover:text-mist sm:px-4"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-spot px-3 py-1.5 text-xs tracking-[0.2em] text-white uppercase sm:px-4"
            >
              Inscription
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
