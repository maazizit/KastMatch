"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Cpu, RefreshCw } from "lucide-react";
import { aiCandidates, type AiCandidate } from "@/lib/ai-candidates";
import { cn } from "@/lib/cn";
import { MatchScoreRing } from "./match-score-ring";
import { AiBadge } from "./ai-badge";


function AnalysisBar({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: number;
  delay?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="tracking-wide text-mist-dim">{label}</span>
        <span className="font-semibold text-mist">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-lens">
        <motion.div
          className="h-full rounded-full bg-spot"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: AiCandidate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      layout
      whileHover={{ y: -2 }}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border bg-ink-elevated p-4 text-left shadow-sm transition",
        selected
          ? "border-spot ring-2 ring-spot/20"
          : "border-frame hover:border-spot/35",
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-lens">
        <Image
          src={candidate.photo}
          alt={candidate.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg text-mist">{candidate.name}</p>
        <p className="truncate text-sm text-mist-dim">
          {candidate.roleFit} · {candidate.city}
        </p>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-spot uppercase">
          AI Match Score
        </p>
      </div>
      <MatchScoreRing score={candidate.matchScore} />
    </motion.button>
  );
}

export function CastingDashboard() {
  const [candidates, setCandidates] = useState(aiCandidates);
  const [selectedId, setSelectedId] = useState(aiCandidates[0].id);
  const selected =
    candidates.find((c) => c.id === selectedId) ?? candidates[0];
  const [scheduled, setScheduled] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  async function rescoreSelected() {
    setScoring(true);
    setScoreError(null);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          castingTitle: "Nuit Blanche — court métrage",
          castingBrief:
            "Drame nocturne intimiste. Lead émotionnel, peu de dialogues, présence caméra forte.",
          role: selected.roleFit,
          talentName: selected.name,
          talentProfile: `${selected.name}. ${selected.summary} Tags: ${selected.tags.join(", ")}. Ville: ${selected.city}.`,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Match IA échoué");
      const r = data.result as {
        matchScore: number;
        roleMatch: number;
        voice: number;
        microExpressions: number;
        summary: string;
      };
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? {
                ...c,
                matchScore: r.matchScore,
                analysis: {
                  roleMatch: r.roleMatch,
                  voice: r.voice,
                  microExpressions: r.microExpressions,
                },
                summary: r.summary,
              }
            : c,
        ),
      );
    } catch (e) {
      setScoreError(e instanceof Error ? e.message : "Erreur scoring");
    } finally {
      setScoring(false);
    }
  }

  return (
    <div className="cinema-stage min-h-[calc(100svh-4.5rem)]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">
                Dashboard Casting
              </p>
              <AiBadge />
            </div>
            <h1 className="font-display text-3xl tracking-tight text-mist md:text-4xl">
              Shortlist IA · Nuit Blanche
            </h1>
            <p className="mt-2 max-w-xl text-sm text-mist-dim md:text-base">
              Matching prédictif sur rôle, voix et micro-expressions — prêt pour
              audition.
            </p>
          </div>
          <p className="text-xs tracking-[0.25em] text-mist-dim uppercase">
            3 candidats scorés
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left 60% ≈ 3/5 */}
          <div className="space-y-3 lg:col-span-3">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                selected={candidate.id === selectedId}
                onSelect={() => {
                  setSelectedId(candidate.id);
                  setScheduled(false);
                  setScoreError(null);
                }}
              />
            ))}
          </div>

          {/* Right 40% ≈ 2/5 */}
          <AnimatePresence mode="wait">
            <motion.aside
              key={selected.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col rounded-2xl border border-frame bg-ink-elevated p-6 shadow-sm lg:col-span-2"
            >
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-lens">
                  <Image
                    src={selected.photo}
                    alt={selected.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-2xl text-mist">
                    {selected.name}
                  </h2>
                  <p className="text-sm text-mist-dim">
                    {selected.roleFit} · {selected.city}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-lens px-2 py-0.5 text-[11px] text-mist-dim"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <MatchScoreRing score={selected.matchScore} size={64} />
              </div>

              <p className="mt-5 text-sm leading-relaxed text-mist-dim">
                {selected.summary}
              </p>

              <div className="mt-6 rounded-xl border border-frame bg-lens/70 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-spot" />
                  <h3 className="font-display text-sm tracking-[0.2em] text-mist uppercase">
                    Analyse IA
                  </h3>
                </div>
                <div className="space-y-4">
                  <AnalysisBar
                    label="Correspondance au rôle"
                    value={selected.analysis.roleMatch}
                    delay={0.05}
                  />
                  <AnalysisBar
                    label="Analyse vocale"
                    value={selected.analysis.voice}
                    delay={0.12}
                  />
                  <AnalysisBar
                    label="Analyse des micro-expressions"
                    value={selected.analysis.microExpressions}
                    delay={0.2}
                  />
                </div>
              </div>

              <div className="mt-auto space-y-2 pt-6">
                <button
                  type="button"
                  onClick={rescoreSelected}
                  disabled={scoring}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-frame px-6 py-3 text-sm font-semibold text-mist transition hover:border-spot/40 hover:text-spot disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${scoring ? "animate-spin" : ""}`}
                  />
                  {scoring ? "Scoring IA…" : "Rescorer avec l’IA live"}
                </button>
                {scoreError && (
                  <p className="text-xs text-spot">{scoreError}</p>
                )}
                <button
                  type="button"
                  onClick={() => setScheduled(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-spot px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)]"
                >
                  <CalendarDays className="h-4 w-4" />
                  {scheduled ? "Audition planifiée ✓" : "Planifier une audition"}
                </button>
              </div>
            </motion.aside>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
