const WORDS = ["Lead", "Voix", "Figuration", "Cascade", "Réalisation", "Image", "Court-métrage", "Série", "Pub", "Doublage"];

/** Bandeau défilant de rôles façon générique. */
export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="relative overflow-hidden border-y border-frame bg-ink-elevated py-6" aria-hidden>
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center">
                <span className={`font-display px-8 text-4xl tracking-tight md:text-6xl ${i % 2 ? "text-outline" : "text-mist"}`}>
                  {w}
                </span>
                <span className="text-spot">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
