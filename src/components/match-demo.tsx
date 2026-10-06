"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { Portrait } from "./portrait";

const METRICS = [
  { label: "Voix", value: 96 },
  { label: "Micro-expressions", value: 91 },
  { label: "Fit au rôle", value: 94 },
];

/** Démo animée : scan d'un visage, ondes vocales, score de match qui monte. */
export function MatchDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const c = animate(0, 94, { duration: 2.6, delay: 0.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setScore(Math.round(v)) });
    return () => c.stop();
  }, [inView]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink px-6 py-28 md:px-14">
      <div className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,var(--spot-soft),transparent_65%)] blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] tracking-[0.4em] text-gold uppercase">Le moteur</p>
          <h2 className="font-display mt-4 text-5xl leading-[0.98] font-light tracking-tight text-mist md:text-7xl">
            Un regard. <br />
            <em className="text-gradient-spot italic">Un score.</em>
          </h2>
          <p className="mt-6 max-w-md text-mist-dim">
            L&apos;IA lit la voix, les micro-expressions et l&apos;adéquation au rôle, puis classe les talents en temps réel — sans perdre la nuance d&apos;une vraie audition.
          </p>
          <ul className="mt-10 space-y-5">
            {METRICS.map((m, i) => (
              <li key={m.label}>
                <div className="flex justify-between font-mono text-[11px] tracking-[0.25em] text-mist-dim uppercase">
                  <span>{m.label}</span>
                  <span className="text-mist">{inView ? m.value : 0}%</span>
                </div>
                <div className="mt-2 h-px bg-white/10">
                  <motion.div
                    className="h-px bg-gradient-to-r from-spot to-gold"
                    initial={{ width: 0 }}
                    animate={{ width: inView ? `${m.value}%` : 0 }}
                    transition={{ duration: 1.6, delay: 0.5 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-frame bg-black shadow-[0_40px_120px_-30px_var(--spot)]"
        >
          <Portrait tone="red" seed={3} className="h-full w-full" />
          <div className="scan-line" />
          {/* points de micro-expressions */}
          {[
            ["38%", "34%"], ["58%", "34%"], ["48%", "46%"], ["42%", "54%"], ["55%", "54%"],
          ].map(([l, t], i) => (
            <motion.span
              key={i}
              style={{ left: l, top: t }}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1 + i * 0.15 }}
              className="absolute h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_2px_var(--gold)]"
            />
          ))}
          <div className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.25em] text-mist/80 uppercase">
            Analyse · live
          </div>
          {/* onde vocale */}
          <div className="absolute inset-x-5 bottom-24 flex h-8 items-end gap-[3px]" aria-hidden>
            {Array.from({ length: 34 }).map((_, i) => (
              <span
                key={i}
                className="w-full origin-bottom rounded-full bg-mist/70"
                style={{ height: "100%", animation: `soundBar ${0.7 + (i % 7) * 0.12}s ease-in-out ${i * 0.04}s infinite` }}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black to-transparent p-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-mist-dim uppercase">Match</p>
              <p className="font-display text-6xl leading-none font-light text-gold tabular-nums">
                {score}
                <span className="text-3xl">%</span>
              </p>
            </div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-spot uppercase">Lead · Drama</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
