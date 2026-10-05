"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

type Props = {
  onCreate: (input: {
    title: string;
    production: string;
    city: string;
    role: string;
    shootDates: string;
    paid: boolean;
    summary: string;
  }) => Promise<void> | void;
};

export function CastingForm({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await onCreate({
        title: String(data.get("title") || "Sans titre"),
        production: String(data.get("production") || ""),
        city: String(data.get("city") || ""),
        role: String(data.get("role") || "Rôle à préciser"),
        shootDates: String(data.get("shootDates") || ""),
        paid: data.get("paid") === "on",
        summary: String(data.get("summary") || ""),
      });
      event.currentTarget.reset();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publication échouée");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-frame bg-ink-elevated p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-mist">Nouveau casting</h2>
          <p className="mt-1 text-sm text-mist-dim">
            Publie un rôle — les talents le voient tout de suite.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-spot px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)]"
        >
          {open ? "Fermer" : "Publier"}
        </button>
      </div>

      {open && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
            Titre
            <input
              name="title"
              required
              className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
              placeholder="Ex. Court métrage — Nuit"
            />
          </label>
          <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
            Production
            <input
              name="production"
              className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
              placeholder="Nom de prod"
            />
          </label>
          <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
            Rôle
            <input
              name="role"
              required
              className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
              placeholder="Lead, 20–30…"
            />
          </label>
          <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
            Ville
            <input
              name="city"
              className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
              placeholder="Casablanca"
            />
          </label>
          <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
            Dates
            <input
              name="shootDates"
              className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
              placeholder="12–15 nov"
            />
          </label>
          <label className="md:col-span-2 grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
            Pitch
            <textarea
              name="summary"
              rows={3}
              required
              minLength={10}
              className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/60"
              placeholder="Ambiance, intention, ce que tu cherches…"
            />
          </label>
          <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-mist">
            <input
              type="checkbox"
              name="paid"
              defaultChecked
              className="size-4 accent-[var(--spot)]"
            />
            Casting payé
          </label>
          {error && (
            <p className="text-sm text-spot md:col-span-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-spot/50 bg-spot/10 px-5 py-2.5 text-sm font-semibold text-spot transition hover:bg-spot hover:text-white disabled:opacity-60 md:justify-self-end"
          >
            {saving ? "Publication…" : "Mettre en ligne"}
          </button>
        </motion.form>
      )}
    </div>
  );
}
