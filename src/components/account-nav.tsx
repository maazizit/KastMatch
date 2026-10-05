"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchMe, logoutRequest, type AuthUser } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  linkClassName?: string;
  ctaClassName?: string;
};

function homeFor(user: AuthUser) {
  return user.role === "DIRECTOR" ? "/director" : "/talent/agents";
}

/** Connexion / Inscription, ou Mon espace / Déconnexion si session active. */
export function AccountNav({ className, linkClassName, ctaClassName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchMe().then((me) => {
      if (!cancelled) {
        setUser(me);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Revenir via le bouton Précédent (bfcache) : re-vérifie la session.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) {
        void fetchMe().then(setUser);
      }
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function onLogout() {
    await logoutRequest();
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  if (!ready) {
    return <div className={cn("h-9 w-40", className)} aria-hidden />;
  }

  if (user) {
    return (
      <div className={cn("flex items-center gap-2", className)} aria-label="Compte">
        <Link href={homeFor(user)} className={linkClassName}>
          Mon espace
        </Link>
        <button type="button" onClick={() => void onLogout()} className={ctaClassName}>
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)} aria-label="Compte">
      <Link href="/login" className={linkClassName}>
        Connexion
      </Link>
      <Link href="/register" className={ctaClassName}>
        Inscription
      </Link>
    </div>
  );
}
