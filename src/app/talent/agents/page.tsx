"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clapperboard,
  Languages,
  Mic2,
  UserRound,
} from "lucide-react";
import { AgentAvatar } from "@/components/agent-avatar";
import { AiBadge } from "@/components/ai-badge";
import { AuthGate } from "@/components/auth-gate";
import { CinemaWatermark } from "@/components/cinema-watermark";
import { SiteNav } from "@/components/site-nav";

const PREP_AGENTS = [
  {
    href: "/talent/tests",
    icon: Languages,
    title: "Tests communication",
    desc: "Visio FR / EN / ES avec Kast — consigne orale, score fluency & fit casting.",
    cta: "Préparer mon test",
  },
  {
    href: "/talent/coach",
    icon: Clapperboard,
    title: "Coach cinéma",
    desc: "Intention, émotion, self-tape — Kast t’entraîne sur ton brief de casting.",
    cta: "Ouvrir le coach",
  },
  {
    href: "/talent/pitch",
    icon: Mic2,
    title: "Préparer mon pitch",
    desc: "Pitch 30–60s pour casting / festival / producteur, reformulé avec l’IA.",
    cta: "Écrire mon pitch",
  },
  {
    href: "/talent/profil",
    icon: UserRound,
    title: "Mon profil talent",
    desc: "Bio, showreel, dispo — la base que les réalisateurs voient.",
    cta: "Compléter le profil",
  },
] as const;

const CHIPS = [
  { label: "Prépare mon test EN", href: "/talent/tests" },
  { label: "Coach self-tape drama", href: "/talent/coach?q=Aide-moi%20%C3%A0%20pr%C3%A9parer%20un%20self-tape%20drama%20intimiste" },
  { label: "Pitch 45 secondes", href: "/talent/pitch" },
  { label: "Améliorer ma bio", href: "/talent/profil" },
] as const;

export default function TalentAgentsPage() {
  const router = useRouter();
  const [ask, setAsk] = useState("");

  function onAsk(event: FormEvent) {
    event.preventDefault();
    const q = ask.trim();
    if (!q) {
      router.push("/talent/coach");
      return;
    }
    router.push(`/talent/coach?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="TALENT">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-10">
        {/* Hero agent Kast */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-8 text-white md:px-10 md:py-10"
        >
          <div
            className="pointer-events-none absolute -top-16 left-6 size-80 rounded-full bg-[radial-gradient(circle,rgba(225,29,72,.4),transparent_65%)]"
            aria-hidden
          />
          <CinemaWatermark className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.05]" />
          <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center">
            <AgentAvatar size={132} rec speaking={false} />
            <div className="flex w-full flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold tracking-[0.14em] text-spot uppercase">
                  Kast · Agent IA casting
                </span>
                <AiBadge />
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                Bonjour — par quoi on commence ?
              </h1>
              <p className="max-w-xl text-sm text-white/70 md:text-base">
                Je t’aide à préparer tests, pitch et castings cinéma. Clique une
                carte ou demande-moi directement.
              </p>

              <form
                onSubmit={onAsk}
                className="mt-2 flex max-w-xl items-center gap-2 rounded-full bg-ink-elevated p-1.5 pl-5"
              >
                <label htmlFor="kast-ask" className="sr-only">
                  Demander à Kast
                </label>
                <input
                  id="kast-ask"
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                  placeholder="Ex. « Prépare mon casting drama en français »"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-mist outline-none placeholder:text-mist-dim"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-spot px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--spot-hover)]"
                >
                  Demander
                </button>
              </form>

              <div className="mt-1 flex flex-wrap gap-2">
                {CHIPS.map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-elevated hover:text-ink"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Se préparer */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl text-mist">Se préparer</h2>
            <span className="text-sm text-mist-dim">
              Tests · coach · pitch · profil
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PREP_AGENTS.map((agent, i) => (
              <motion.div
                key={agent.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link
                  href={agent.href}
                  className="flex h-full flex-col gap-2.5 rounded-[20px] border border-frame bg-ink-elevated p-5 shadow-sm transition hover:-translate-y-1 hover:border-spot/35 hover:shadow-md"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-spot/10 text-spot">
                    <agent.icon className="h-5 w-5" />
                  </span>
                  <strong className="font-display text-lg text-mist">
                    {agent.title}
                  </strong>
                  <span className="text-sm leading-relaxed text-mist-dim">
                    {agent.desc}
                  </span>
                  <span className="mt-auto pt-2 text-sm font-bold text-spot">
                    {agent.cta} →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      </AuthGate>
    </div>
  );
}
