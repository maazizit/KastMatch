"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clapperboard, Sparkles } from "lucide-react";
import { AiBadge } from "./ai-badge";
import { Dust } from "./dust";
import { FilmReel } from "./film-reel";
import { Magnetic } from "./magnetic";
import { Timecode } from "./timecode";

const ease = [0.22, 1, 0.36, 1] as const;

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: "110%", rotate: 3 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ duration: 1.1, ease, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  return (
    <section className="cinema-stage relative flex min-h-[100svh] flex-col overflow-hidden">
      <div
        className="beam pointer-events-none absolute -top-10 right-[22%] h-[110vh] w-[90vw]"
        aria-hidden
      />
      <Dust />
      <div
        className="spotlight-orb pointer-events-none absolute top-1/3 right-[10%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,var(--spot-soft),transparent_65%)] blur-3xl"
        aria-hidden
      />

      {/* repères de cadrage */}
      {["top-5 left-5 border-t border-l", "top-5 right-5 border-t border-r", "bottom-5 left-5 border-b border-l", "bottom-5 right-5 border-b border-r"].map((c) => (
        <span key={c} className={`pointer-events-none absolute z-10 h-6 w-6 border-white/30 ${c}`} aria-hidden />
      ))}

      <FilmReel />

      <header className="relative z-20 flex items-center justify-between gap-4 px-8 py-8 md:px-14">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-wrap items-center gap-3"
        >
          <p className="font-display text-xl tracking-[0.32em] text-mist uppercase md:text-2xl">
            Kast<span className="text-spot">Match</span>
          </p>
          <AiBadge className="hidden sm:inline-flex" />
        </motion.div>
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase sm:gap-3"
          aria-label="Compte"
        >
          <Link href="/login" className="rounded-full px-3 py-2 text-mist-dim transition hover:text-mist">
            Connexion
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-mist/30 px-4 py-2 text-mist transition hover:border-spot hover:bg-spot"
          >
            Inscription
          </Link>
        </motion.nav>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-8 pb-24 md:max-w-[62%] md:px-14">
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="mb-8 flex items-center gap-4 font-mono text-[11px] tracking-[0.35em] text-gold uppercase"
        >
          <span className="h-px w-12 bg-gold/70" />
          Casting · Cinéma · Beta privée
        </motion.p>

        <h1 className="font-display text-[clamp(3.4rem,9.5vw,8.6rem)] leading-[0.9] font-light tracking-[-0.035em] text-mist">
          <Line delay={0.2}>Le set</Line>
          <Line delay={0.32}>trouve</Line>
          <Line delay={0.44}>
            <em className="text-gradient-spot pr-3 font-normal italic">son talent.</em>
          </Line>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.8 }}
          className="mt-9 max-w-md text-base leading-relaxed text-mist-dim md:text-lg"
        >
          KastMatch relie réalisateurs et talents grâce à une IA de matching
          prédictif — voix, micro-expressions et fit au rôle, scorés en temps
          réel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.95 }}
          className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Magnetic>
            <Link
              href="/register?role=TALENT"
              className="group inline-flex items-center gap-2.5 rounded-full bg-spot px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-[0_0_40px_-6px_var(--spot)] transition duration-300 hover:bg-[var(--spot-hover)]"
            >
              <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
              Je suis talent
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              href="/register?role=DIRECTOR"
              className="group inline-flex items-center gap-2.5 rounded-full border border-mist/25 px-8 py-4 text-sm font-semibold tracking-wide text-mist backdrop-blur transition duration-300 hover:border-mist hover:bg-mist hover:text-ink"
            >
              <Clapperboard className="h-4 w-4" />
              Je recrute
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Magnetic>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="relative z-10 flex items-end justify-between px-8 pb-9 md:px-14"
      >
        <div className="flex items-center gap-4 font-mono text-[11px] tracking-[0.4em] text-mist-dim uppercase">
          <span className="relative block h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 h-4 bg-spot"
              animate={{ y: [-16, 40] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          Scroll · ouvre le clap
        </div>
        <Timecode className="hidden sm:block" />
      </motion.div>
    </section>
  );
}
