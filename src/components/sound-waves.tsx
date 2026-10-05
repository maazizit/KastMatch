"use client";

import { cn } from "@/lib/cn";

type Props = {
  active?: boolean;
  className?: string;
  bars?: number;
};

/** Ondes sonores — parle / écoute (touche cinéma). */
export function SoundWaves({ active = true, className, bars = 5 }: Props) {
  return (
    <span
      className={cn("inline-flex h-4 items-end gap-[3px]", className)}
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full bg-current",
            active ? "animate-[soundBar_0.9s_ease-in-out_infinite]" : "h-1 opacity-40",
          )}
          style={
            active
              ? {
                  animationDelay: `${i * 0.12}s`,
                  height: `${8 + ((i * 5) % 10)}px`,
                }
              : undefined
          }
        />
      ))}
    </span>
  );
}
