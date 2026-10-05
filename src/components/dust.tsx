"use client";

import { useMemo } from "react";

/** Poussière en suspension dans le faisceau (positions déterministes). */
export function Dust({ count = 28 }: { count?: number }) {
  const specks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        const q = (n: number) => Math.round(n * 100) / 100;
        return {
          left: `${q(r(1) * 100)}%`,
          top: `${q(20 + r(2) * 70)}%`,
          size: q(1 + r(3) * 2.5),
          dur: q(7 + r(4) * 9),
          delay: q(-r(5) * 12),
          dx: Math.round((r(6) - 0.5) * 80),
          dy: Math.round(-(60 + r(7) * 160)),
        };
      }),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {specks.map((s, i) => (
        <span
          key={i}
          className="dust"
          style={
            {
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
