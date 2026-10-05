"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AgentAvatar } from "@/components/agent-avatar";
import { AiBadge } from "@/components/ai-badge";

type Msg = { role: "user" | "assistant"; content: string };

export function CoachClient() {
  const searchParams = useSearchParams();
  const [brief, setBrief] = useState(
    "Court métrage drama — lead féminin 25–35, ton intimiste, peu de dialogues.",
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Salut — je suis Kast. Colle ton brief, puis dis-moi où tu bloques (intention, émotion, self-tape, langue…).",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    if (!textOverride) setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "coach",
          message: text,
          castingBrief: brief,
          history: nextHistory.slice(0, -1),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Erreur coach");
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

  useEffect(() => {
    if (bootstrapped) return;
    const q = searchParams.get("q")?.trim();
    setBootstrapped(true);
    if (q) void send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, bootstrapped]);

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[0.9fr_1.3fr] md:px-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-frame bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <AgentAvatar size={96} rec speaking={loading} />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="font-display text-2xl text-mist">Coach cinéma</h1>
              <AiBadge />
            </div>
            <p className="text-sm text-mist-dim">Agent Kast · casting ready</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-mist-dim">
          Entraînement intention / émotion / self-tape — ancré sur ton brief.
        </p>
        <label className="mt-6 grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
          Brief casting
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
          />
        </label>
        <Link
          href="/talent/agents"
          className="mt-6 inline-block text-sm font-semibold text-spot"
        >
          ← Hub agents
        </Link>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex min-h-[70vh] flex-col rounded-3xl border border-frame bg-white shadow-sm"
      >
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-spot text-white"
                  : "bg-lens text-mist"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && <p className="text-sm text-mist-dim">Kast réfléchit…</p>}
          {error && <p className="text-sm text-spot">{error}</p>}
        </div>
        <div className="border-t border-frame p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ex: Comment jouer la retenue sans paraître froid ?"
              className="flex-1 rounded-full border border-frame bg-lens px-4 py-2.5 text-sm outline-none focus:border-spot/60"
            />
            <button
              type="button"
              onClick={() => send()}
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
