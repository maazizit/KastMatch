"use client";

import { motion } from "framer-motion";
import type { Talent } from "@/lib/types";

const availabilityLabel = {
  available: "Dispo",
  limited: "Limité",
  booked: "Booké",
} as const;

type Props = {
  talent: Talent;
  index?: number;
  onShortlist?: () => void;
  shortlisted?: boolean;
  onOpen?: () => void;
  selected?: boolean;
};

export function TalentCard({
  talent,
  index = 0,
  onShortlist,
  shortlisted,
  onOpen,
  selected,
}: Props) {
  const cover = talent.photos?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className={`overflow-hidden rounded-2xl border bg-ink-elevated shadow-sm ${
        selected ? "border-spot ring-1 ring-spot/40" : "border-frame"
      }`}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className="aspect-[16/10] w-full object-cover"
        />
      ) : talent.showreelUrl ? (
        <div className="relative aspect-[16/10] bg-ink">
          <video
            src={talent.showreelUrl}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover opacity-80"
          />
          <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] tracking-wider text-white uppercase">
            Vidéo
          </span>
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-lens text-xs tracking-[0.25em] text-mist-dim uppercase">
          Sans média
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-mist">{talent.name}</h3>
            <p className="mt-1 text-xs tracking-[0.25em] text-mist-dim uppercase">
              {talent.city || "—"}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] tracking-wider uppercase ${
              talent.availability === "available"
                ? "bg-spot/15 text-spot"
                : talent.availability === "limited"
                  ? "bg-flare/15 text-flare"
                  : "bg-frame text-mist-dim"
            }`}
          >
            {availabilityLabel[talent.availability]}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-mist-dim">
          {talent.tagline || "Pas d’accroche"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {talent.roles.slice(0, 3).map((role) => (
            <span
              key={role}
              className="rounded-full border border-frame px-2 py-0.5 text-[10px] text-mist"
            >
              {role}
            </span>
          ))}
          {talent.languages.slice(0, 2).map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-lens px-2 py-0.5 text-[10px] text-mist-dim"
            >
              {lang}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="w-full rounded-full bg-spot px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)]"
            >
              Voir fiche
            </button>
          )}
          {onShortlist && (
            <button
              type="button"
              onClick={onShortlist}
              className={`w-full rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                shortlisted
                  ? "border-spot bg-spot/15 text-spot"
                  : "border-frame text-mist hover:border-spot/50 hover:text-spot"
              }`}
            >
              {shortlisted ? "Dans la shortlist" : "Shortlister"}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
