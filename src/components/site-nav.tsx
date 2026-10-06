"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { AiBadge } from "./ai-badge";
import { ThemeToggle } from "./theme-toggle";
import { apiGetUnreadCount } from "@/lib/api-client";
import { fetchMe, logoutRequest, type AuthUser } from "@/lib/auth-client";

const publicLinks = [{ href: "/", label: "Accueil" }] as const;

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void fetchMe().then(setUser);
  }, [pathname]);

  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!user) return;
    const load = () => void apiGetUnreadCount().then(setUnread).catch(() => {});
    load();
    const t = setInterval(() => {
      if (!document.hidden) load();
    }, 15000);
    return () => clearInterval(t);
  }, [user, pathname]);

  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) void fetchMe().then(setUser);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const links =
    user?.role === "DIRECTOR"
      ? [
          ...publicLinks,
          { href: "/director/talents", label: "Talents" },
          { href: "/director", label: "Castings" },
          { href: "/director/assistant", label: "Assistant IA" },
          { href: "/director/dashboard", label: "Dashboard IA" },
          { href: "/messages", label: "Messages" },
        ]
      : user?.role === "TALENT"
        ? [
            ...publicLinks,
            { href: "/talent", label: "Castings" },
            { href: "/talent/agents", label: "Agents" },
            { href: "/talent/profil", label: "Mon profil" },
            { href: "/messages", label: "Messages" },
          ]
        : [
            ...publicLinks,
            { href: "/talent", label: "Castings" },
            { href: "/director", label: "Réalisateur" },
          ];

  async function onLogout() {
    await logoutRequest();
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="relative z-20 flex items-center justify-between gap-3 border-b border-[color:var(--nav-border)] bg-ink/70 px-6 py-5 backdrop-blur-xl md:px-12">
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
              {link.href === "/messages" && user && unread > 0 && (
                <span className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-spot px-1 text-[9px] font-bold tracking-normal text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          );
        })}
        <ThemeToggle />
        {user ? (
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-full px-3 py-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase transition hover:text-spot sm:px-4"
          >
            Déconnexion
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
              className="rounded-full bg-spot px-3 py-1.5 text-xs tracking-[0.2em] text-white uppercase transition hover:bg-[var(--spot-hover)] sm:px-4"
            >
              Inscription
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
