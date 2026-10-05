"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard, Sparkles } from "lucide-react";
import { AiBadge } from "./ai-badge";
import { FilmReel } from "./film-reel";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="cinema-stage relative flex min-h-[100svh] flex-col overflow-hidden">
      <div
        className="spotlight-orb pointer-events-none absolute -top-24 right-[8%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,var(--spot-soft),transparent_68%)] blur-2xl"
        aria-hidden
      />

      <FilmReel />

      <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-wrap items-center gap-3"
        >
          <p className="font-display text-xl tracking-[0.28em] text-mist uppercase md:text-2xl">
            Kast<span className="text-spot">Match</span>
          </p>
          <AiBadge />
        </motion.div>
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase sm:gap-3"
          aria-label="Compte"
        >
          <Link
            href="/login"
            className="rounded-full px-3 py-1.5 text-mist-dim transition hover:text-mist"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-spot px-3 py-1.5 text-white transition hover:bg-[var(--spot-hover)]"
          >
            Inscription
          </Link>
        </motion.nav>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-20 md:max-w-[58%] md:px-12">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.9, ease }}
          className="mb-8 h-px w-24 origin-left bg-gradient-to-r from-spot to-transparent"
        />

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="font-display text-[clamp(2.8rem,8vw,5.6rem)] leading-[0.92] tracking-[-0.03em] text-mist"
        >
          Le set trouve
          <br />
          <span className="text-spot">son talent.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.25 }}
          className="mt-6 max-w-md text-base leading-relaxed text-mist-dim md:text-lg"
        >
          KastMatch relie réalisateurs et talents grâce à une IA de matching
          prédictif — voix, micro-expressions et fit au rôle, scorés en temps
          réel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.4 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/register?role=TALENT"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-spot px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition duration-300 hover:bg-[var(--spot-hover)]"
          >
            <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
            Je suis talent
          </Link>
          <Link
            href="/register?role=DIRECTOR"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-frame bg-ink-elevated px-7 py-3.5 text-sm font-semibold tracking-wide text-mist shadow-sm transition duration-300 hover:border-spot/40 hover:text-spot"
          >
            <Clapperboard className="h-4 w-4" />
            Je recrute
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="relative z-10 px-6 pb-8 md:px-12"
      >
        <p className="text-[11px] tracking-[0.4em] text-mist-dim uppercase">
          Scroll · ouvre le clap
        </p>
      </motion.div>
    </section>
  );
}
