"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Portrait } from "./portrait";

const TALENTS = [
  { name: "Amel R.", role: "Lead · Drame", city: "Paris", score: 94, tone: "red" },
  { name: "Yanis K.", role: "Voix · AR/FR", city: "Marseille", score: 91, tone: "gold" },
  { name: "Inès B.", role: "Lead · Thriller", city: "Lyon", score: 89, tone: "teal" },
  { name: "Malik D.", role: "Cascade", city: "Bruxelles", score: 87, tone: "ivory" },
  { name: "Sofia L.", role: "Lead · Comédie", city: "Casablanca", score: 92, tone: "red" },
  { name: "Noah T.", role: "Doublage", city: "Montréal", score: 90, tone: "gold" },
] as const;

/** Galerie horizontale pinnée : le scroll vertical fait défiler les planches-contact. */
export function TalentReel() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-62%"]);

  return (
    <section ref={ref} className="relative h-[320vh] bg-background">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="px-6 md:px-14">
          <p className="font-mono text-[11px] tracking-[0.4em] text-gold uppercase">Planche-contact</p>
          <h2 className="font-display mt-3 max-w-2xl text-4xl leading-none font-light tracking-tight text-mist md:text-6xl">
            Les visages <em className="text-gradient-spot italic">du prochain plan.</em>
          </h2>
        </div>
        <motion.div style={{ x }} className="mt-10 flex gap-6 pl-6 md:pl-14">
          {TALENTS.map((t, i) => (
            <figure
              key={t.name}
              className="group relative w-[62vw] shrink-0 overflow-hidden rounded-xl border border-frame bg-black transition duration-500 hover:-translate-y-2 hover:border-spot/50 md:w-[24vw]"
              style={{ rotate: `${(i % 2 ? 1 : -1) * 0.8}deg` }}
            >
              <Portrait tone={t.tone} seed={i} className="aspect-[3/4] w-full transition duration-700 group-hover:scale-105" />
              <div className="absolute top-3 right-3 rounded-full border border-gold/40 bg-black/60 px-3 py-1 font-mono text-xs text-gold backdrop-blur">
                {t.score}%
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                <p className="font-mono text-[10px] tracking-[0.3em] text-spot uppercase">
                  {String(i + 1).padStart(2, "0")} · {t.role}
                </p>
                <p className="font-display mt-1 text-2xl text-mist">{t.name}</p>
                <p className="text-xs text-mist-dim">{t.city}</p>
              </figcaption>
            </figure>
          ))}
        </motion.div>
        <div className="mx-6 mt-8 h-px bg-white/10 md:mx-14">
          <motion.div className="h-px origin-left bg-spot" style={{ scaleX: scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}
