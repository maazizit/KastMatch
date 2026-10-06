"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GitCompare, Loader2, Sparkles, Wand2 } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { SiteNav } from "@/components/site-nav";
import { MatchScoreRing } from "@/components/match-score-ring";
import {
  apiAiBrief,
  apiAiCompare,
  apiAiMatch,
  type AiCompareResult,
  type AiMatchRow,
  type CharacterSheet,
} from "@/lib/api-client";
import {
  BUILD_OPTIONS,
  EYE_OPTIONS,
  GENDER_OPTIONS,
  HAIR_OPTIONS,
} from "@/lib/physical";
import { cn } from "@/lib/cn";

const field =
  "rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist outline-none focus:border-spot/70";
const lab = "grid gap-1.5 text-[11px] tracking-[0.2em] text-mist-dim uppercase";

const num = (v: string): number | null => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};
const csv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

function Chips({
  options,
  value,
  onChange,
}: {
  options: readonly { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options
        .filter((o) => o.value)
        .map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                on ? "border-spot bg-spot/15 text-spot" : "border-frame text-mist-dim hover:border-spot/40",
              )}
            >
              {o.label}
            </button>
          );
        })}
    </div>
  );
}

function Assistant() {
  const [brief, setBrief] = useState("");
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [results, setResults] = useState<AiMatchRow[] | null>(null);
  const [aiUsed, setAiUsed] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [compare, setCompare] = useState<AiCompareResult | null>(null);
  const [busy, setBusy] = useState<"brief" | "match" | "compare" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<CharacterSheet>) => setSheet((s) => (s ? { ...s, ...p } : s));

  async function run<T>(kind: "brief" | "match" | "compare", fn: () => Promise<T>) {
    setBusy(kind);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function analyse() {
    const s = await run("brief", () => apiAiBrief(brief));
    if (!s) return;
    setSheet(s);
    setResults(null);
    setCompare(null);
    setPicked([]);
    await search(s);
  }

  async function search(s: CharacterSheet | null = sheet) {
    if (!s) return;
    const r = await run("match", () => apiAiMatch(brief, s));
    if (!r) return;
    setResults(r.results);
    setAiUsed(r.aiUsed);
    setCompare(null);
    setPicked([]);
  }

  async function doCompare() {
    if (!sheet) return;
    const r = await run("compare", () => apiAiCompare(brief, sheet, picked));
    if (r) setCompare(r);
  }

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-12 md:px-12">
      <div>
        <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">Assistant IA</p>
        <h1 className="font-display mt-3 text-4xl tracking-tight text-mist md:text-5xl">
          Décris ton projet, on trouve les talents.
        </h1>
        <p className="mt-4 max-w-2xl text-mist-dim">
          Colle ton synopsis ou la description du rôle. L&apos;IA en tire une fiche personnage, puis classe
          les talents de la plateforme avec un score expliqué.
        </p>
      </div>

      {/* 1. Brief */}
      <section className="rounded-2xl border border-frame bg-ink-elevated p-5">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">1 · Ton projet</p>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="Ex. Court-métrage dramatique à Casablanca. Je cherche une femme d'une trentaine d'années, fragile mais déterminée, qui parle arabe et français, pour incarner une infirmière de nuit…"
          className={cn(field, "mt-3 w-full resize-y")}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-mist-dim tabular-nums">{brief.length}/4000</span>
          <button
            type="button"
            onClick={() => void analyse()}
            disabled={busy !== null || brief.trim().length < 20}
            className="inline-flex items-center gap-2 rounded-full bg-spot px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)] disabled:opacity-50"
          >
            {busy === "brief" || busy === "match" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {busy === "brief" ? "Analyse du brief…" : busy === "match" ? "Recherche des talents…" : "Analyser et chercher"}
          </button>
        </div>
      </section>

      {error && <p className="rounded-xl border border-spot/40 bg-spot/10 px-4 py-3 text-sm text-spot">{error}</p>}

      {/* 2. Fiche personnage */}
      <AnimatePresence>
        {sheet && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-frame bg-ink-elevated p-5"
          >
            <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">2 · Fiche personnage</p>
            <p className="font-display mt-2 text-2xl text-mist">{sheet.title || "Personnage"}</p>
            {sheet.summary && <p className="mt-1 text-sm text-mist-dim">{sheet.summary}</p>}
            {sheet.traits.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sheet.traits.map((t) => (
                  <span key={t} className="rounded-full bg-lens px-3 py-1 text-xs text-mist-dim">{t}</span>
                ))}
              </div>
            )}
            {sheet.voice && <p className="mt-3 text-sm text-mist-dim"><span className="text-mist">Voix :</span> {sheet.voice}</p>}

            <p className="mt-5 text-xs text-mist-dim">Ajuste les critères si besoin, puis relance la recherche.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className={lab}>
                Genre
                <select value={sheet.gender} onChange={(e) => patch({ gender: e.target.value })} className={field}>
                  {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <div className={lab}>
                Âge de jeu
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={sheet.ageMin ?? ""} onChange={(e) => patch({ ageMin: num(e.target.value) })} placeholder="min" className={field} />
                  <input type="number" value={sheet.ageMax ?? ""} onChange={(e) => patch({ ageMax: num(e.target.value) })} placeholder="max" className={field} />
                </div>
              </div>
              <div className={lab}>
                Taille (cm)
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={sheet.heightMin ?? ""} onChange={(e) => patch({ heightMin: num(e.target.value) })} placeholder="min" className={field} />
                  <input type="number" value={sheet.heightMax ?? ""} onChange={(e) => patch({ heightMax: num(e.target.value) })} placeholder="max" className={field} />
                </div>
              </div>
              <label className={lab}>
                Langues (codes)
                <input value={sheet.languages.join(", ")} onChange={(e) => patch({ languages: csv(e.target.value) })} placeholder="ar, fr" className={field} />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className={lab}>Corpulence<Chips options={BUILD_OPTIONS} value={sheet.builds} onChange={(v) => patch({ builds: v })} /></div>
              <div className={lab}>Cheveux<Chips options={HAIR_OPTIONS} value={sheet.hair} onChange={(v) => patch({ hair: v })} /></div>
              <div className={lab}>Yeux<Chips options={EYE_OPTIONS} value={sheet.eyes} onChange={(v) => patch({ eyes: v })} /></div>
            </div>
            <button
              type="button"
              onClick={() => void search()}
              disabled={busy !== null}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-spot/40 bg-spot/10 px-5 py-2.5 text-sm font-semibold text-spot transition hover:bg-spot hover:text-white disabled:opacity-50"
            >
              {busy === "match" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Relancer la recherche
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 3. Résultats */}
      {results && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">3 · Talents suggérés</p>
              <p className="mt-1 text-sm text-mist-dim">
                {results.length} profil{results.length > 1 ? "s" : ""}
                {!aiUsed && " · classement sur critères uniquement (analyse IA indisponible)"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void doCompare()}
              disabled={picked.length < 2 || busy !== null}
              className="inline-flex items-center gap-2 rounded-full bg-mist px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-spot hover:text-white disabled:opacity-40"
            >
              {busy === "compare" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
              Comparer ({picked.length}/3)
            </button>
          </div>

          {results.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-frame px-5 py-12 text-center text-sm text-mist-dim">
              Aucun talent sur la plateforme pour l&apos;instant.
            </p>
          ) : (
            <ul className="grid gap-3">
              {results.map((r, i) => {
                const on = picked.includes(r.id);
                return (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn("rounded-2xl border bg-ink-elevated p-4", on ? "border-spot" : "border-frame")}
                  >
                    <div className="flex gap-4">
                      {r.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.photo} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-lens text-[10px] text-mist-dim uppercase">Profil</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-display truncate text-xl text-mist">{r.name}</p>
                            <p className="truncate text-sm text-mist-dim">{r.city || "—"}{r.tagline ? ` · ${r.tagline}` : ""}</p>
                          </div>
                          <MatchScoreRing score={r.score} size={56} />
                        </div>
                        {r.reason && <p className="mt-2 text-sm text-mist">{r.reason}</p>}
                        <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                          {r.strengths.length > 0 && (
                            <ul className="space-y-0.5 text-flare">
                              {r.strengths.map((s) => <li key={s}>＋ {s}</li>)}
                            </ul>
                          )}
                          {r.risks.length > 0 && (
                            <ul className="space-y-0.5 text-mist-dim">
                              {r.risks.map((s) => <li key={s}>△ {s}</li>)}
                            </ul>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-mist-dim">
                            <input type="checkbox" checked={on} onChange={() => togglePick(r.id)} className="accent-[var(--spot)]" />
                            Comparer
                          </label>
                          <Link href={`/director/talents?id=${r.id}`} className="text-xs font-semibold text-spot hover:underline">
                            Voir la fiche et contacter →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* 4. Comparaison */}
      {compare && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-spot/30 bg-ink-elevated p-5">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">4 · Comparaison</p>
          <div className={cn("mt-4 grid gap-4", compare.talents.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
            {compare.talents.map((t) => (
              <div key={t.id} className="rounded-xl border border-frame bg-lens/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg text-mist">{t.name}</p>
                  <span className="font-display text-2xl text-gold tabular-nums">{t.fit}%</span>
                </div>
                <ul className="mt-3 space-y-1 text-xs text-flare">{t.strengths.map((s) => <li key={s}>＋ {s}</li>)}</ul>
                <ul className="mt-2 space-y-1 text-xs text-mist-dim">{t.risks.map((s) => <li key={s}>△ {s}</li>)}</ul>
                <Link href={`/director/talents?id=${t.id}`} className="mt-3 inline-block text-xs font-semibold text-spot hover:underline">Fiche →</Link>
              </div>
            ))}
          </div>
          {compare.differentiators.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-mist-dim">
              {compare.differentiators.map((d) => <li key={d}>{d}</li>)}
            </ul>
          )}
          {compare.recommendation && (
            <p className="mt-4 rounded-xl bg-spot/10 px-4 py-3 text-sm text-mist"><strong className="text-spot">Recommandation :</strong> {compare.recommendation}</p>
          )}
        </motion.section>
      )}

      <p className="text-xs text-mist-dim">
        Les scores sont une aide à la décision, pas un verdict : voix et expressions ne sont évaluées que d&apos;après
        les textes et la description du profil.
      </p>
    </main>
  );
}

export default function DirectorAssistantPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="DIRECTOR">
        <Assistant />
      </AuthGate>
    </div>
  );
}
