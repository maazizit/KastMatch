"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AgentAvatar } from "@/components/agent-avatar";
import { AiBadge } from "@/components/ai-badge";
import { AuthGate } from "@/components/auth-gate";
import { SiteNav } from "@/components/site-nav";

type Msg = { role: "user" | "assistant"; content: string };

function PitchClient() {
  const [context, setContext] = useState(
    "Casting court métrage drama — je postule lead, 28 ans, Casablanca, bilingue AR/FR.",
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Je suis Kast — on va forger ton pitch casting (30–60s). Décris ton projet ou colle une première version, je la structure et la rends caméra-ready.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(preset?: string) {
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    if (!preset) setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "pitch",
          message: text,
          castingBrief: context,
          history: nextHistory.slice(0, -1),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Erreur pitch");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply as string },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[0.85fr_1.25fr] md:px-10">
      <motion.aside
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-frame bg-ink-elevated p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <AgentAvatar size={88} rec />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <p className="font-display text-xl text-mist">Pitch casting</p>
              <AiBadge />
            </div>
            <p className="text-sm text-mist-dim">Agent Kast · 30–60 secondes</p>
          </div>
        </div>
        <label className="mt-6 grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
          Contexte
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={5}
            className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Écris un pitch 45s",
            "Version plus émotionnelle",
            "Version anglaise",
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => void send(chip)}
              className="rounded-full border border-frame px-3 py-1.5 text-xs font-semibold text-mist hover:border-spot/40 hover:text-spot"
            >
              {chip}
            </button>
          ))}
        </div>
        <Link
          href="/talent/agents"
          className="mt-6 inline-block text-sm font-semibold text-spot"
        >
          ← Retour agents
        </Link>
      </motion.aside>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[70vh] flex-col rounded-3xl border border-frame bg-ink-elevated shadow-sm"
      >
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-spot text-white"
                  : "bg-lens text-mist"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <p className="text-sm text-mist-dim">Kast écrit ton pitch…</p>
          )}
          {error && <p className="text-sm text-spot">{error}</p>}
        </div>
        <div className="border-t border-frame p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              placeholder="Colle ton pitch brouillon ou dis ce que tu veux vendre…"
              className="flex-1 rounded-full border border-frame bg-lens px-4 py-2.5 text-sm outline-none focus:border-spot/60"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading}
              className="rounded-full bg-spot px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--spot-hover)] disabled:opacity-60"
            >
              Envoyer
            </button>
          </div>
        </div>
      </motion.section>
    </main>
  );
}

export default function TalentPitchPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="TALENT">
        <PitchClient />
      </AuthGate>
    </div>
  );
}
