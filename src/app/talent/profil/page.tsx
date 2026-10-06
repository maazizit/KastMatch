"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { AuthGate } from "@/components/auth-gate";
import { PhysicalSection } from "@/components/physical-section";
import { PortfolioManager } from "@/components/portfolio-manager";
import { PresentationRecorder } from "@/components/presentation-recorder";
import { TalentProfilePanel } from "@/components/talent-profile-panel";
import {
  apiGetMyProfile,
  apiUpdateMyProfile,
  availabilityFromApi,
  availabilityToApi,
  type PortfolioPhoto,
} from "@/lib/api-client";
import {
  defaultProfile,
  profileCompleteness,
  type TalentProfile,
} from "@/lib/talent-profile";
import { toIntOrNull } from "@/lib/physical";
import type { Talent } from "@/lib/types";

function splitCsv(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProfilForm() {
  const [profile, setProfile] = useState<TalentProfile>(defaultProfile);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { user } = await apiGetMyProfile();
        const p = user.talentProfile;
        setEmail(user.email || "");
        setProfile({
          name: user.name || "",
          city: p?.city || "",
          roles: p?.roles || "",
          languages: p?.languages || "",
          tagline: p?.tagline || "",
          bio: p?.bio || "",
          phone: p?.phone || "",
          showreelUrl: p?.showreelUrl || "",
          availability: availabilityFromApi(p?.availability),
          gender: p?.gender || "",
          ageMin: p?.ageMin != null ? String(p.ageMin) : "",
          ageMax: p?.ageMax != null ? String(p.ageMax) : "",
          heightCm: p?.heightCm != null ? String(p.heightCm) : "",
          build: p?.build || "",
          hairColor: p?.hairColor || "",
          eyeColor: p?.eyeColor || "",
          appearance: p?.appearance || "",
          distinctFeatures: p?.distinctFeatures || "",
          physicalDescription: p?.physicalDescription || "",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Chargement impossible");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const completeness = profileCompleteness(profile);

  const recruiterView: Talent = useMemo(
    () => ({
      id: "preview",
      name: profile.name || "Ton nom",
      city: profile.city || "Ville",
      roles: splitCsv(profile.roles),
      languages: splitCsv(profile.languages),
      tagline: profile.tagline || "Ton accroche apparaîtra ici",
      bio: profile.bio || undefined,
      availability: profile.availability,
      showreelUrl: profile.showreelUrl || undefined,
      photos: photos.map((p) => p.url),
      phone: profile.phone || undefined,
      email: email || undefined,
      physical: {
        gender: profile.gender,
        ageMin: toIntOrNull(profile.ageMin),
        ageMax: toIntOrNull(profile.ageMax),
        heightCm: toIntOrNull(profile.heightCm),
        build: profile.build,
        hairColor: profile.hairColor,
        eyeColor: profile.eyeColor,
        appearance: profile.appearance,
        distinctFeatures: profile.distinctFeatures,
        physicalDescription: profile.physicalDescription,
      },
    }),
    [profile, photos, email],
  );

  function update<K extends keyof TalentProfile>(key: K, value: TalentProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiUpdateMyProfile({
        name: profile.name,
        city: profile.city,
        roles: profile.roles,
        languages: profile.languages,
        tagline: profile.tagline,
        bio: profile.bio,
        phone: profile.phone,
        showreelUrl: profile.showreelUrl,
        availability: availabilityToApi(profile.availability),
        gender: profile.gender,
        ageMin: toIntOrNull(profile.ageMin),
        ageMax: toIntOrNull(profile.ageMax),
        heightCm: toIntOrNull(profile.heightCm),
        build: profile.build,
        hairColor: profile.hairColor,
        eyeColor: profile.eyeColor,
        appearance: profile.appearance,
        distinctFeatures: profile.distinctFeatures,
        physicalDescription: profile.physicalDescription,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement échoué");
    } finally {
      setSaving(false);
    }
  }

  async function persistShowreel(url: string) {
    update("showreelUrl", url);
    try {
      await apiUpdateMyProfile({ showreelUrl: url });
      setSaved(true);
    } catch {
      /* upload API already saved if logged in */
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">
          Espace perso
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight text-mist md:text-5xl">
          Mon profil talent
        </h1>
        <p className="mt-4 max-w-2xl text-mist-dim">
          Édite à gauche — à droite, la carte exacte que voient les réalisateurs
          dans leur shortlist.
        </p>
      </motion.div>

      <div className="mt-8 rounded-2xl border border-frame bg-ink-elevated/80 p-5 md:max-w-xl">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-mist-dim">Complétion</span>
          <span className="font-semibold text-spot">{completeness}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-lens">
          <motion.div
            className="h-full rounded-full bg-spot"
            initial={false}
            animate={{ width: `${completeness}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {!ready ? (
        <p className="mt-10 text-mist-dim">Chargement…</p>
      ) : (
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            onSubmit={handleSubmit}
            className="grid gap-5"
          >
            <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
              Nom complet
              <input
                value={profile.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                placeholder="Salma Bennani"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
                Ville
                <input
                  value={profile.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                />
              </label>
              <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
                Téléphone (WhatsApp)
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                  placeholder="06 12 34 56 78"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
              Disponibilité
              <select
                value={profile.availability}
                onChange={(e) =>
                  update(
                    "availability",
                    e.target.value as TalentProfile["availability"],
                  )
                }
                className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
              >
                <option value="available">Disponible</option>
                <option value="limited">Limité</option>
                <option value="booked">Booké</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
              Rôles (séparés par virgule)
              <input
                value={profile.roles}
                onChange={(e) => update("roles", e.target.value)}
                className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                placeholder="Lead, Drama, Comedy"
              />
            </label>

            <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
              Langues
              <input
                value={profile.languages}
                onChange={(e) => update("languages", e.target.value)}
                className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                placeholder="AR, FR, EN"
              />
            </label>

            <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
              Accroche
              <input
                value={profile.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                placeholder="Présence caméra intimiste…"
              />
            </label>

            <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
              Bio
              <textarea
                value={profile.bio}
                onChange={(e) => update("bio", e.target.value)}
                rows={4}
                className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                placeholder="Expérience, formations, ce que tu cherches…"
              />
            </label>

            <PresentationRecorder
              value={
                profile.showreelUrl.startsWith("/") ||
                profile.showreelUrl.includes("/presentations/")
                  ? profile.showreelUrl
                  : undefined
              }
              onSaved={(url) => void persistShowreel(url)}
              onCleared={() => void persistShowreel("")}
            />

            <PhysicalSection value={profile} onChange={update} />

            <PortfolioManager onPhotosChange={setPhotos} />

            <label className="grid gap-1.5 text-xs tracking-[0.2em] text-mist-dim uppercase">
              Lien showreel externe (optionnel)
              <input
                type="url"
                value={
                  profile.showreelUrl.startsWith("http") &&
                  !profile.showreelUrl.includes("/presentations/")
                    ? profile.showreelUrl
                    : ""
                }
                onChange={(e) => update("showreelUrl", e.target.value)}
                className="rounded-xl border border-frame bg-lens px-3 py-2.5 text-sm normal-case tracking-normal text-mist outline-none focus:border-spot/70"
                placeholder="https://vimeo.com/… (si tu n’utilises pas la caméra)"
              />
            </label>

            {error && <p className="text-sm text-spot">{error}</p>}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-spot px-7 py-3 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)] disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer mon profil"}
              </button>
              <Link
                href="/talent"
                className="rounded-full border border-frame px-7 py-3 text-center text-sm font-semibold text-mist transition hover:border-spot/50 hover:text-spot"
              >
                Voir les castings
              </Link>
              {saved && (
                <span className="text-sm text-spot">Profil enregistré ✓</span>
              )}
            </div>
          </motion.form>

          <aside className="lg:sticky lg:top-8">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gold" />
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">
                  Vue réalisateur
                </p>
                <p className="mt-1 text-xs text-mist-dim">
                  Aperçu live — comme dans leur dashboard.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-mist/20 bg-ink/40 p-3">
              <TalentProfilePanel talent={recruiterView} />
            </div>
            {!profile.showreelUrl && photos.length === 0 && (
              <p className="mt-3 text-xs leading-relaxed text-mist-dim">
                Ajoute une vidéo ou des photos pour que ta carte soit complète
                côté recruteur.
              </p>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default function TalentProfilPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="TALENT">
        <ProfilForm />
      </AuthGate>
    </div>
  );
}
