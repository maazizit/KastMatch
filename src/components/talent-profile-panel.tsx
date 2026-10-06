"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Mail,
  MessageCircle,
  MessageSquare,
  Loader2,
  Phone,
  X,
} from "lucide-react";
import { apiStartConversation } from "@/lib/api-client";
import type { Talent } from "@/lib/types";
import {
  buildLabel,
  eyeLabel,
  genderLabel,
  hairLabel,
  playingAgeLabel,
} from "@/lib/physical";
import {
  defaultContactMessage,
  mailtoHref,
  whatsappHref,
} from "@/lib/contact";

const availabilityLabel = {
  available: "Disponible",
  limited: "Disponibilité limitée",
  booked: "Booké",
} as const;

type Props = {
  talent: Talent;
  onClose?: () => void;
  footer?: React.ReactNode;
  /** Préfixe de message (ex. titre casting). */
  castingHint?: string;
};

function isPlayableVideo(url: string) {
  if (url.startsWith("/") || url.includes("/presentations/") || url.includes("/api/videos/")) {
    return true;
  }
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

/** Fiche profil complète — vue réalisateur (médias + contact). */
export function TalentProfilePanel({
  talent,
  onClose,
  footer,
  castingHint,
}: Props) {
  const baseMessage = useMemo(() => {
    if (!castingHint) return defaultContactMessage(talent.name);
    return `Bonjour ${talent.name},\n\nJe vous contacte via KastMatch concernant « ${castingHint} ».\n\nCordialement`;
  }, [talent.name, castingHint]);

  const [message, setMessage] = useState(baseMessage);
  const [copied, setCopied] = useState<"email" | "phone" | null>(null);
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const canMessage = talent.id !== "preview";

  async function sendInApp() {
    setSending(true);
    setSendError(null);
    try {
      const id = await apiStartConversation({
        talentId: talent.id,
        body: message,
        castingHint,
      });
      router.push(`/messages?c=${id}`);
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Envoi impossible");
      setSending(false);
    }
  }

  useEffect(() => {
    setMessage(baseMessage);
  }, [baseMessage]);

  const wa = talent.phone ? whatsappHref(talent.phone, message) : null;
  const mail =
    talent.email
      ? mailtoHref(
          talent.email,
          castingHint
            ? `KastMatch — ${castingHint}`
            : `KastMatch — contact ${talent.name}`,
          message,
        )
      : null;

  async function copy(value: string, kind: "email" | "phone") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <article className="flex h-full max-h-[min(92vh,900px)] flex-col overflow-hidden rounded-2xl border border-frame bg-ink-elevated shadow-lg">
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

        <PhysicalBlock talent={talent} />

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
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-lg border border-frame transition hover:border-spot/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Portfolio ${talent.name}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {talent.showreelUrl && (
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-mist-dim uppercase">
              Vidéo de présentation
            </p>
            {isPlayableVideo(talent.showreelUrl) ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-frame bg-ink">
                <video
                  src={talent.showreelUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                />
              </div>
            ) : (
              <a
                href={talent.showreelUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-center rounded-xl border border-frame bg-lens px-4 py-8 text-sm font-semibold text-spot transition hover:border-spot/50"
              >
                Ouvrir le showreel →
              </a>
            )}
          </div>
        )}

        {!talent.showreelUrl && (!talent.photos || talent.photos.length === 0) && (
          <p className="rounded-xl border border-dashed border-frame px-4 py-6 text-center text-sm text-mist-dim">
            Pas encore de média — seul le texte du profil est disponible.
          </p>
        )}

        {/* Contact */}
        <section className="rounded-2xl border border-frame bg-lens/60 p-4">
          <p className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">
            Contacter
          </p>

          <ul className="mt-3 space-y-2">
            {talent.email ? (
              <li className="flex items-center justify-between gap-2 rounded-xl border border-frame bg-ink-elevated px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-spot" />
                  <a
                    href={`mailto:${talent.email}`}
                    className="truncate text-sm text-mist hover:text-spot"
                  >
                    {talent.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => void copy(talent.email!, "email")}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-mist-dim hover:text-spot"
                  aria-label="Copier l’email"
                >
                  {copied === "email" ? (
                    <Check className="h-3.5 w-3.5 text-flare" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </li>
            ) : (
              <li className="text-sm text-mist-dim">Email non disponible</li>
            )}

            {talent.phone ? (
              <li className="flex items-center justify-between gap-2 rounded-xl border border-frame bg-ink-elevated px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-spot" />
                  <a
                    href={`tel:${talent.phone.replace(/\s/g, "")}`}
                    className="truncate text-sm text-mist hover:text-spot"
                  >
                    {talent.phone}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => void copy(talent.phone!, "phone")}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-mist-dim hover:text-spot"
                  aria-label="Copier le numéro"
                >
                  {copied === "phone" ? (
                    <Check className="h-3.5 w-3.5 text-flare" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </li>
            ) : (
              <li className="text-sm text-mist-dim">
                Téléphone non renseigné par le talent
              </li>
            )}
          </ul>

          <label className="mt-4 grid gap-1.5">
            <span className="font-mono text-[10px] tracking-[0.2em] text-mist-dim uppercase">
              Message
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="rounded-xl border border-frame bg-ink-elevated px-3 py-2.5 text-sm text-mist outline-none focus:border-spot/70"
            />
          </label>

          {canMessage && (
            <>
              <button
                type="button"
                onClick={() => void sendInApp()}
                disabled={sending || !message.trim()}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-spot px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)] disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                Envoyer dans KastMatch
              </button>
              {sendError && <p className="mt-2 text-sm text-spot">{sendError}</p>}
            </>
          )}

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            ) : (
              <span
                title="Ajoutez le téléphone du talent pour WhatsApp"
                className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-frame px-4 py-3 text-sm font-semibold text-mist-dim opacity-60"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </span>
            )}
            {mail ? (
              <a
                href={mail}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-spot/40 bg-spot/10 px-4 py-3 text-sm font-semibold text-spot transition hover:bg-spot hover:text-white"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            ) : (
              <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-frame px-4 py-3 text-sm font-semibold text-mist-dim opacity-60">
                <Mail className="h-4 w-4" />
                Email
              </span>
            )}
          </div>
        </section>
      </div>

      {footer && (
        <footer className="border-t border-frame px-5 py-4">{footer}</footer>
      )}
    </article>
  );
}

function PhysicalBlock({ talent }: { talent: Talent }) {
  const ph = talent.physical;
  if (!ph) return null;
  const rows: [string, string][] = [
    ["Genre", ph.gender ? genderLabel(ph.gender) : ""],
    ["Âge de jeu", playingAgeLabel(ph.ageMin, ph.ageMax)],
    ["Taille", ph.heightCm ? `${ph.heightCm} cm` : ""],
    ["Corpulence", ph.build ? buildLabel(ph.build) : ""],
    ["Cheveux", ph.hairColor ? hairLabel(ph.hairColor) : ""],
    ["Yeux", ph.eyeColor ? eyeLabel(ph.eyeColor) : ""],
    ["Apparence", ph.appearance],
    ["Signes distinctifs", ph.distinctFeatures],
  ];
  const shown = rows.filter(([, v]) => v);
  if (shown.length === 0 && !ph.physicalDescription) return null;
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.25em] text-mist-dim uppercase">
        Physique
      </p>
      {shown.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {shown.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] text-mist-dim">{k}</dt>
              <dd className="text-mist">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {ph.physicalDescription && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-mist-dim">
          {ph.physicalDescription}
        </p>
      )}
    </div>
  );
}
