"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  BUILD_OPTIONS,
  EYE_OPTIONS,
  GENDER_OPTIONS,
  HAIR_OPTIONS,
  physicalFilled,
  type PhysicalProfile,
} from "@/lib/physical";

type Props = {
  value: PhysicalProfile;
  onChange: <K extends keyof PhysicalProfile>(key: K, value: PhysicalProfile[K]) => void;
};

const field =
  "rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70";
const label = "grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase";

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Description physique : c'est ce qui permet aux réalisateurs (et à l'IA) de te trouver. */
export function PhysicalSection({ value, onChange }: Props) {
  const { filled, total } = physicalFilled(value);
  const done = filled === total;

  return (
    <section className="rounded-2xl border border-spot/30 bg-spot/[0.06] p-5">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-spot" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">
            Description physique
          </p>
          <p className="mt-1 text-sm text-mist">
            <strong className="font-semibold">C&apos;est important :</strong> les
            réalisateurs filtrent par âge de jeu, taille, corpulence… et notre IA
            s&apos;en sert pour te proposer aux rôles qui te correspondent. Plus
            c&apos;est précis, meilleur est ton match.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-lens">
              <motion.div
                className="h-full rounded-full bg-spot"
                initial={false}
                animate={{ width: `${(filled / total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <span className="font-mono text-xs text-mist-dim tabular-nums">
              {filled}/{total}
            </span>
          </div>
          {done && <p className="mt-2 text-xs text-flare">Parfait — ton profil est prêt pour le matching ✓</p>}
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className={label}>
          Genre
          <Select value={value.gender} onChange={(v) => onChange("gender", v)} options={GENDER_OPTIONS} />
        </label>

        <div className={label}>
          Âge de jeu (ans)
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <input
              type="number"
              min={5}
              max={99}
              inputMode="numeric"
              value={value.ageMin}
              onChange={(e) => onChange("ageMin", e.target.value)}
              placeholder="25"
              className={field}
              aria-label="Âge de jeu minimum"
            />
            <span className="text-mist-dim">à</span>
            <input
              type="number"
              min={5}
              max={99}
              inputMode="numeric"
              value={value.ageMax}
              onChange={(e) => onChange("ageMax", e.target.value)}
              placeholder="35"
              className={field}
              aria-label="Âge de jeu maximum"
            />
          </div>
        </div>

        <label className={label}>
          Taille (cm)
          <input
            type="number"
            min={100}
            max={230}
            inputMode="numeric"
            value={value.heightCm}
            onChange={(e) => onChange("heightCm", e.target.value)}
            placeholder="172"
            className={field}
          />
        </label>

        <label className={label}>
          Corpulence
          <Select value={value.build} onChange={(v) => onChange("build", v)} options={BUILD_OPTIONS} />
        </label>

        <label className={label}>
          Cheveux
          <Select value={value.hairColor} onChange={(v) => onChange("hairColor", v)} options={HAIR_OPTIONS} />
        </label>

        <label className={label}>
          Yeux
          <Select value={value.eyeColor} onChange={(v) => onChange("eyeColor", v)} options={EYE_OPTIONS} />
        </label>
      </div>

      <label className={`${label} mt-5`}>
        Signes distinctifs (optionnel)
        <input
          value={value.distinctFeatures}
          onChange={(e) => onChange("distinctFeatures", e.target.value)}
          maxLength={300}
          placeholder="Barbe, tatouage, cicatrice, lunettes, fossettes…"
          className={field}
        />
      </label>

      <label className={`${label} mt-5`}>
        Apparence (optionnel)
        <input
          value={value.appearance}
          onChange={(e) => onChange("appearance", e.target.value)}
          maxLength={120}
          placeholder="Ex. type méditerranéen, nordique… — uniquement si tu le souhaites"
          className={field}
        />
        <span className="text-[11px] normal-case tracking-normal text-mist-dim">
          Champ facultatif, que tu contrôles : il sert seulement à t&apos;associer à des rôles qui le demandent.
        </span>
      </label>

      <label className={`${label} mt-5`}>
        Décris-toi physiquement
        <textarea
          value={value.physicalDescription}
          onChange={(e) => onChange("physicalDescription", e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Silhouette, allure, visage, présence à l'écran… Ce que le réalisateur verrait en te croisant."
          className={field}
        />
        <span className="text-right text-[11px] normal-case tracking-normal text-mist-dim tabular-nums">
          {value.physicalDescription.length}/1000
        </span>
      </label>
    </section>
  );
}
