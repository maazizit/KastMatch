"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Magnetic } from "./magnetic";
import { Dust } from "./dust";

const CREDITS = ["Casting · Cinéma · Private beta", "Voix", "Micro-expressions", "Fit au rôle", "Un match"];

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 py-36 text-center md:px-14">
      <Dust count={20} />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[60vh] -translate-y-1/2 bg-[radial-gradient(ellipse,var(--spot-soft),transparent_65%)] blur-3xl" />
      <motion.h2
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="font-display relative mx-auto max-w-4xl text-6xl leading-[0.95] font-light tracking-tight text-mist md:text-9xl"
      >
        Moteur. <br />
        <em className="text-gradient-spot italic">Action.</em>
      </motion.h2>
      <div className="relative mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Magnetic>
          <Link href="/register?role=TALENT" className="inline-block rounded-full bg-spot px-9 py-4 text-sm font-semibold text-white shadow-[0_0_50px_-6px_var(--spot)] transition hover:bg-[var(--spot-hover)]">
            Créer mon profil talent
          </Link>
        </Magnetic>
        <Magnetic>
          <Link href="/register?role=DIRECTOR" className="inline-block rounded-full border border-mist/30 px-9 py-4 text-sm font-semibold text-mist transition hover:bg-mist hover:text-ink">
            Publier un casting
          </Link>
        </Magnetic>
      </div>
      <ul className="relative mt-24 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.35em] text-mist-dim uppercase">
        {CREDITS.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </section>
  );
}
