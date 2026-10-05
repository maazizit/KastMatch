"use client";

const FRAMES = [
  "Lead · drama",
  "Extra · crowd",
  "Voice · AR/FR",
  "Stunt · action",
  "Director · short",
  "DP · handheld",
];

export function FilmReel() {
  const loop = [...FRAMES, ...FRAMES];

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(38vw,420px)] overflow-hidden md:block"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink/20 to-ink" />
      <div className="reel-strip absolute inset-x-8 top-0 flex flex-col gap-3 py-8">
        {loop.map((label, i) => (
          <div
            key={`${label}-${i}`}
            className="relative aspect-[16/10] overflow-hidden rounded-sm border border-frame bg-white shadow-md"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-spot/15 via-transparent to-flare/10" />
            <div className="absolute inset-y-0 left-0 flex w-5 flex-col justify-between py-2">
              {Array.from({ length: 6 }).map((_, hole) => (
                <span
                  key={hole}
                  className="mx-auto h-2.5 w-2.5 rounded-full bg-frame"
                />
              ))}
            </div>
            <div className="absolute inset-y-0 right-0 flex w-5 flex-col justify-between py-2">
              {Array.from({ length: 6 }).map((_, hole) => (
                <span
                  key={hole}
                  className="mx-auto h-2.5 w-2.5 rounded-full bg-frame"
                />
              ))}
            </div>
            <p className="font-display absolute bottom-4 left-8 right-8 text-sm tracking-[0.2em] text-mist-dim uppercase">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
