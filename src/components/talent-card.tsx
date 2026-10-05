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
};

export function TalentCard({
  talent,
  index = 0,
  onShortlist,
  shortlisted,
}: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-frame bg-white p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-mist">{talent.name}</h3>
          <p className="mt-1 text-xs tracking-[0.25em] text-mist-dim uppercase">
            {talent.city}
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
      <p className="mt-4 text-sm leading-relaxed text-mist-dim">{talent.tagline}</p>
      {talent.showreelUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-frame bg-ink">
          <video
            src={talent.showreelUrl}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {talent.roles.map((role) => (
          <span
            key={role}
            className="rounded-full border border-frame px-2.5 py-1 text-[11px] tracking-wide text-mist"
          >
            {role}
          </span>
        ))}
        {talent.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-full bg-lens px-2.5 py-1 text-[11px] tracking-wide text-mist-dim"
          >
            {lang}
          </span>
        ))}
      </div>
      {onShortlist && (
        <button
          type="button"
          onClick={onShortlist}
          className={`mt-6 w-full rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
            shortlisted
              ? "border-spot bg-spot/15 text-spot"
              : "border-frame text-mist hover:border-spot/50 hover:text-spot"
          }`}
        >
          {shortlisted ? "Dans la shortlist" : "Shortlister"}
        </button>
      )}
    </motion.article>
  );
}
