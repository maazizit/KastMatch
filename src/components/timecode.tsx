"use client";

import { useEffect, useState } from "react";

/** Timecode façon caméra : HH:MM:SS:FF qui défile. */
export function Timecode({ className }: { className?: string }) {
  const [t, setT] = useState<string | null>(null);

  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      const ms = performance.now() - start;
      const f = Math.floor((ms / 1000) * 24) % 24;
      const s = Math.floor(ms / 1000) % 60;
      const m = Math.floor(ms / 60000) % 60;
      const p = (n: number) => String(n).padStart(2, "0");
      setT(`00:${p(m)}:${p(s)}:${p(f)}`);
    }, 41);
    return () => clearInterval(id);
  }, []);

  return (
    <p className={`font-mono text-[11px] tracking-[0.3em] text-mist-dim ${className ?? ""}`} aria-hidden>
      <span className="mr-3 inline-block h-2 w-2 animate-pulse rounded-full bg-spot align-middle" />
      REC {t ?? "00:00:00:00"}
    </p>
  );
}
