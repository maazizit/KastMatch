"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchMe, type AuthUser } from "@/lib/auth-client";

type Props = {
  role?: "TALENT" | "DIRECTOR";
  children: ReactNode | ((user: AuthUser) => ReactNode);
};

export function AuthGate({ role, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const me = await fetchMe();
      if (cancelled) return;
      if (!me) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (role && me.role !== role) {
        router.replace(me.role === "DIRECTOR" ? "/director" : "/talent/agents");
        return;
      }
      setUser(me);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, role, router]);

  if (!ready || !user) {
    return (
      <div className="cinema-stage flex min-h-[40svh] items-center justify-center text-sm text-mist-dim">
        Chargement…
      </div>
    );
  }

  return <>{typeof children === "function" ? children(user) : children}</>;
}
