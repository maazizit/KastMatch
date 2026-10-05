"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Globe, Mic, Sparkles, VideoOff, Volume2 } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { AiBadge } from "@/components/ai-badge";
import { AuthGate } from "@/components/auth-gate";
import { SoundWaves } from "@/components/sound-waves";
import {
  InterviewerAvatar,
  type InterviewerAvatarState,
} from "@/components/interviewer-avatar";

type Lang = "fr" | "en" | "es";
type Phase = "prep" | "live" | "result";

const LANGS: { id: Lang; label: string; locale: string }[] = [
  { id: "fr", label: "Français", locale: "fr-FR" },
  { id: "en", label: "English", locale: "en-US" },
  { id: "es", label: "Español", locale: "es-ES" },
];

type Generated = {
  prompt: string;
  tips: string[];
  expectedFocus: string[];
};

type Evaluated = {
  score: number;
  fluency: number;
  clarity: number;
  castingFit: number;
  feedback: string;
  improvedVersion: string;
};

function speakPrompt(
  text: string,
  locale: string,
  onStart: () => void,
  onEnd: () => void,
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onStart();
    window.setTimeout(onEnd, 1600);
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = locale;
  utter.rate = 1;
  utter.onstart = onStart;
  utter.onend = onEnd;
  utter.onerror = onEnd;
  window.speechSynthesis.speak(utter);
}

export default function TalentTestsPage() {
  const [phase, setPhase] = useState<Phase>("prep");
  const [language, setLanguage] = useState<Lang>("en");
  const [micOk, setMicOk] = useState(false);
  const [testingMic, setTestingMic] = useState(false);
  const [avatarState, setAvatarState] =
    useState<InterviewerAvatarState>("idle");
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Evaluated | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const locale =
    LANGS.find((l) => l.id === language)?.locale ?? "en-US";

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  async function testMic() {
    setTestingMic(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicOk(true);
    } catch {
      setMicOk(false);
      setError("Micro inaccessible — tu peux quand même répondre à l’écrit.");
    } finally {
      setTestingMic(false);
    }
  }

  async function startLive() {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswer("");
    setAvatarState("thinking");
    try {
      const res = await fetch("/api/ai/language-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", language, level: "B1" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Erreur génération");
      const gen = data.result as Generated;
      setGenerated(gen);
      setPhase("live");
      speakPrompt(
        gen.prompt,
        locale,
        () => setAvatarState("speaking"),
        () => {
          setAvatarState("listening");
          answerRef.current?.focus();
        },
      );
    } catch (e) {
      setAvatarState("idle");
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function replayPrompt() {
    if (!generated) return;
    speakPrompt(
      generated.prompt,
      locale,
      () => setAvatarState("speaking"),
      () => setAvatarState("listening"),
    );
  }

  async function evaluate() {
    if (!generated || !answer.trim()) return;
    setLoading(true);
    setError(null);
    setAvatarState("thinking");
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    try {
      const res = await fetch("/api/ai/language-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          language,
          prompt: generated.prompt,
          answer,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Erreur évaluation");
      setResult(data.result as Evaluated);
      setPhase("result");
      setAvatarState("idle");
    } catch (e) {
      setAvatarState("listening");
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="TALENT">
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        {phase === "prep" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-frame bg-ink-elevated shadow-sm"
          >
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-frame bg-lens/50 p-6 md:border-r md:border-b-0">
                <InterviewerAvatar name="Kast" state="idle" layout="card" />
              </div>
              <div className="flex flex-col p-6 md:p-8">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-spot/10 px-3 py-1 text-xs font-semibold tracking-wide text-spot">
                    <Sparkles className="h-3.5 w-3.5" />
                    Visio casting
                  </span>
                  <AiBadge />
                </div>
                <h1 className="font-display text-3xl text-mist md:text-4xl">
                  Test de communication
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-mist-dim md:text-base">
                  Visio casting avec Kast : une consigne à l’oral, ta réponse,
                  puis un score IA sur clarté, fluency et fit casting — en FR,
                  EN ou ES.
                </p>

                <div className="mt-6">
                  <p className="mb-2 flex items-center gap-2 text-xs tracking-[0.2em] text-mist-dim uppercase">
                    <Globe className="h-3.5 w-3.5" />
                    Langue du test
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LANGS.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLanguage(l.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          language === l.id
                            ? "bg-spot text-white"
                            : "border border-frame text-mist hover:border-spot/40"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <ul className="mt-6 space-y-2 text-sm text-mist-dim">
                  {[
                    "Casque ou micro recommandé",
                    "Réponds naturellement — comme en audition",
                    "Tu peux réécouter la consigne à tout moment",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-spot" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={testMic}
                    disabled={testingMic}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-frame px-5 py-3 text-sm font-semibold text-mist hover:border-spot/40"
                  >
                    <Mic className="h-4 w-4" />
                    {testingMic
                      ? "Test micro…"
                      : micOk
                        ? "Micro OK ✓"
                        : "Tester le micro"}
                  </button>
                  <button
                  type="button"
                  onClick={startLive}
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-spot px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--spot-hover)] disabled:opacity-60"
                >
                  {loading ? "Préparation…" : "Démarrer l’entretien IA"}
                </button>
                </div>
                <Link
                  href="/talent/agents"
                  className="mt-4 inline-block text-sm font-semibold text-spot"
                >
                  ← Hub agents
                </Link>
                {error && (
                  <p className="mt-3 text-sm text-spot" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "live" && generated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-frame bg-ink-elevated p-4 shadow-sm md:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AiBadge />
                <span className="text-xs tracking-[0.25em] text-mist-dim uppercase">
                  Live · {LANGS.find((l) => l.id === language)?.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setPhase("prep");
                  setAvatarState("idle");
                }}
                className="text-xs font-semibold tracking-wide text-mist-dim uppercase hover:text-spot"
              >
                Quitter
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative rounded-2xl bg-ink p-3 md:p-4">
                <div className="relative">
                  <InterviewerAvatar
                    name="Kast"
                    state={avatarState}
                    layout="stage"
                  />
                  {/* PiP — ta caméra (visio casting) */}
                  <div className="absolute right-3 bottom-3 z-10 flex h-24 w-36 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-[#1a1a1f]/95 shadow-lg backdrop-blur-sm sm:h-28 sm:w-40">
                    <VideoOff className="h-5 w-5 text-white/55" />
                    <span className="text-[10px] font-semibold tracking-wide text-white/65 uppercase">
                      Votre caméra
                    </span>
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-spot/90 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-white">
                      <span className="size-1 animate-pulse rounded-full bg-white" />
                      REC
                    </span>
                  </div>
                </div>
                <p className="mt-3 flex items-center justify-center gap-2 text-xs tracking-wide text-white/70">
                  <span>
                    {avatarState === "speaking"
                      ? "Kast pose la consigne…"
                      : avatarState === "thinking"
                        ? "Analyse en cours…"
                        : "À toi — réponds comme en casting"}
                  </span>
                  {(avatarState === "speaking" ||
                    avatarState === "listening") && (
                    <SoundWaves
                      active
                      className={
                        avatarState === "speaking" ? "text-spot" : "text-white/80"
                      }
                    />
                  )}
                </p>
              </div>

              <div className="flex flex-col rounded-2xl border border-frame bg-lens/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs tracking-[0.2em] text-mist-dim uppercase">
                    Consigne
                  </p>
                  <button
                    type="button"
                    onClick={replayPrompt}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-spot"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Réécouter
                  </button>
                </div>
                <p className="rounded-xl bg-ink-elevated p-3 text-sm leading-relaxed text-mist shadow-sm">
                  {generated.prompt}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {generated.tips.map((tip) => (
                    <span
                      key={tip}
                      className="rounded-full bg-ink-elevated px-2.5 py-1 text-[11px] text-mist-dim"
                    >
                      {tip}
                    </span>
                  ))}
                </div>
                <textarea
                  ref={answerRef}
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (avatarState !== "listening") setAvatarState("listening");
                  }}
                  rows={5}
                  placeholder="Ta réponse (comme à l’oral)…"
                  className="mt-4 flex-1 rounded-xl border border-frame bg-ink-elevated px-3 py-2.5 text-sm outline-none focus:border-spot/60"
                />
                <button
                  type="button"
                  onClick={evaluate}
                  disabled={loading || !answer.trim()}
                  className="mt-3 rounded-full bg-spot px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--spot-hover)] disabled:opacity-60"
                >
                  {loading ? "Évaluation IA…" : "Envoyer ma réponse"}
                </button>
                {error && (
                  <p className="mt-2 text-sm text-spot" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 md:grid-cols-[0.7fr_1.3fr]"
          >
            <div className="rounded-3xl border border-frame bg-ink-elevated p-5 shadow-sm">
              <InterviewerAvatar name="Kast" state="idle" layout="card" />
            </div>
            <div className="rounded-3xl border border-frame bg-ink-elevated p-6 shadow-sm">
              <p className="font-display text-sm tracking-[0.3em] text-spot uppercase">
                Résultat
              </p>
              <p className="font-display mt-2 text-5xl text-spot">
                {result.score}%
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-lens p-3">
                  <p className="text-mist-dim">Fluency</p>
                  <p className="font-semibold">{result.fluency}</p>
                </div>
                <div className="rounded-xl bg-lens p-3">
                  <p className="text-mist-dim">Clarté</p>
                  <p className="font-semibold">{result.clarity}</p>
                </div>
                <div className="rounded-xl bg-lens p-3">
                  <p className="text-mist-dim">Fit casting</p>
                  <p className="font-semibold">{result.castingFit}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-mist-dim">
                {result.feedback}
              </p>
              <div className="mt-4 rounded-xl border border-frame bg-lens/70 p-4">
                <p className="text-xs tracking-[0.2em] text-spot uppercase">
                  Version améliorée
                </p>
                <p className="mt-2 text-sm text-mist">{result.improvedVersion}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhase("prep");
                  setGenerated(null);
                  setResult(null);
                  setAnswer("");
                  setAvatarState("idle");
                }}
                className="mt-6 rounded-full bg-spot px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--spot-hover)]"
              >
                Refaire un test
              </button>
            </div>
          </motion.div>
        )}
      </main>
      </AuthGate>
    </div>
  );
}
