"use client";

import { motion } from "framer-motion";
import type { Casting } from "@/lib/types";

type Props = {
  casting: Casting;
  index?: number;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export function CastingCard({
  casting,
  index = 0,
  actionLabel = "Postuler",
  onAction,
  actionDisabled,
}: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="flex flex-col rounded-2xl border border-frame bg-ink-elevated p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-spot uppercase">
            {casting.production}
          </p>
          <h3 className="font-display mt-2 text-xl text-mist">{casting.title}</h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase ${
            casting.paid
              ? "bg-spot/15 text-spot"
              : "bg-frame text-mist-dim"
          }`}
        >
          {casting.paid ? "Payé" : "Bénévolat"}
        </span>
      </div>
      <p className="mt-3 text-sm text-mist-dim">{casting.summary}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-xs text-mist-dim">
        <div>
          <dt className="tracking-[0.2em] uppercase">Rôle</dt>
          <dd className="mt-1 text-mist">{casting.role}</dd>
        </div>
        <div>
          <dt className="tracking-[0.2em] uppercase">Ville</dt>
          <dd className="mt-1 text-mist">{casting.city}</dd>
        </div>
        <div>
          <dt className="tracking-[0.2em] uppercase">Tournage</dt>
          <dd className="mt-1 text-mist">{casting.shootDates}</dd>
        </div>
        <div>
          <dt className="tracking-[0.2em] uppercase">Réal.</dt>
          <dd className="mt-1 text-mist">{casting.director}</dd>
        </div>
      </dl>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={actionDisabled}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-spot px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)] disabled:cursor-default disabled:bg-frame disabled:text-mist-dim"
        >
          {actionLabel}
        </button>
      )}
    </motion.article>
  );
}
