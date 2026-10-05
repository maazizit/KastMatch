"use client";

import { X } from "lucide-react";
import type { Talent } from "@/lib/types";

const availabilityLabel = {
  available: "Disponible",
  limited: "Disponibilité limitée",
  booked: "Booké",
} as const;

type Props = {
  talent: Talent;
  onClose?: () => void;
  footer?: React.ReactNode;
};

/** Fiche profil complète — vue réalisateur. */
export function TalentProfilePanel({ talent, onClose, footer }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-frame bg-ink-elevated shadow-lg">
      <header className="flex items-start justify-between gap-3 border-b border-frame px-5 py-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
            Fiche talent
          </p>
          <h2 className="font-display mt-1 text-2xl text-mist">{talent.name}</h2>
          <p className="mt-1 text-sm text-mist-dim">
            {talent.city || "Ville non renseignée"}
            {" · "}
            {availabilityLabel[talent.availability]}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-9 place-items-center rounded-full border border-frame text-mist-dim transition hover:border-spot hover:text-spot"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {talent.tagline && (
          <p className="text-base leading-relaxed text-mist">{talent.tagline}</p>
        )}
        {talent.bio && (
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-mist-dim uppercase">
              Bio
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mist-dim">
              {talent.bio}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {talent.roles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-frame px-3 py-1 text-xs text-mist"
            >
              {role}
            </span>
          ))}
          {talent.languages.map((lang) => (
            <span
              key={lang}
              className="rounded-full bg-lens px-3 py-1 text-xs text-mist-dim"
            >
              {lang}
            </span>
          ))}
        </div>

        {talent.photos && talent.photos.length > 0 && (
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-mist-dim uppercase">
              Portfolio · {talent.photos.length} photo
              {talent.photos.length > 1 ? "s" : ""}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {talent.photos.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`Portfolio ${talent.name}`}
                  className="aspect-[3/4] w-full rounded-lg border border-frame object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {talent.showreelUrl && (
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-mist-dim uppercase">
              Vidéo de présentation
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-frame bg-ink">
              <video
                src={talent.showreelUrl}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full object-cover"
              />
            </div>
          </div>
        )}

        {!talent.showreelUrl && (!talent.photos || talent.photos.length === 0) && (
          <p className="rounded-xl border border-dashed border-frame px-4 py-6 text-center text-sm text-mist-dim">
            Pas encore de média — seul le texte du profil est disponible.
          </p>
        )}
      </div>

      {footer && (
        <footer className="border-t border-frame px-5 py-4">{footer}</footer>
      )}
    </article>
  );
}
