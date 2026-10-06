"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { SiteNav } from "@/components/site-nav";
import { TalentCard } from "@/components/talent-card";
import { TalentProfilePanel } from "@/components/talent-profile-panel";
import { apiGetTalents, mapTalent } from "@/lib/api-client";
import {
  BUILD_OPTIONS,
  EYE_OPTIONS,
  GENDER_OPTIONS,
  HAIR_OPTIONS,
} from "@/lib/physical";
import type { Talent } from "@/lib/types";

function DirectorTalentsBrowser() {
  const searchParams = useSearchParams();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("");
  const [language, setLanguage] = useState("");
  const [availability, setAvailability] = useState<
    "all" | Talent["availability"]
  >("all");
  const [mediaOnly, setMediaOnly] = useState(false);
  const [gender, setGender] = useState("");
  const [build, setBuild] = useState("");
  const [hair, setHair] = useState("");
  const [eyes, setEyes] = useState("");
  const [playAge, setPlayAge] = useState("");
  const [heightMin, setHeightMin] = useState("");
  const [heightMax, setHeightMax] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get("id"),
  );

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const list = await apiGetTalents();
        setTalents(list.map(mapTalent));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Chargement impossible");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setSelectedId(id);
  }, [searchParams]);

  const cities = useMemo(
    () =>
      [...new Set(talents.map((t) => t.city).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "fr"),
      ),
    [talents],
  );
  const roles = useMemo(
    () =>
      [...new Set(talents.flatMap((t) => t.roles))].sort((a, b) =>
        a.localeCompare(b, "fr"),
      ),
    [talents],
  );
  const languages = useMemo(
    () =>
      [...new Set(talents.flatMap((t) => t.languages))].sort((a, b) =>
        a.localeCompare(b, "fr"),
      ),
    [talents],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return talents.filter((t) => {
      if (availability !== "all" && t.availability !== availability) return false;
      if (city && t.city !== city) return false;
      if (role && !t.roles.some((r) => r.toLowerCase() === role.toLowerCase()))
        return false;
      if (
        language &&
        !t.languages.some((l) => l.toLowerCase() === language.toLowerCase())
      )
        return false;
      if (mediaOnly && !t.showreelUrl && !(t.photos && t.photos.length > 0))
        return false;
      const ph = t.physical;
      if (gender && ph?.gender !== gender) return false;
      if (build && ph?.build !== build) return false;
      if (hair && ph?.hairColor !== hair) return false;
      if (eyes && ph?.eyeColor !== eyes) return false;
      const age = parseInt(playAge, 10);
      if (Number.isFinite(age)) {
        const lo = ph?.ageMin ?? ph?.ageMax;
        const hi = ph?.ageMax ?? ph?.ageMin;
        if (lo == null || hi == null || age < lo || age > hi) return false;
      }
      const hMin = parseInt(heightMin, 10);
      const hMax = parseInt(heightMax, 10);
      if (Number.isFinite(hMin) && (ph?.heightCm == null || ph.heightCm < hMin)) return false;
      if (Number.isFinite(hMax) && (ph?.heightCm == null || ph.heightCm > hMax)) return false;
      if (!q) return true;
      const hay = [
        t.name,
        t.city,
        t.tagline,
        t.bio ?? "",
        ...t.roles,
        ...t.languages,
        t.physical?.physicalDescription ?? "",
        t.physical?.distinctFeatures ?? "",
        t.physical?.appearance ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [talents, query, city, role, language, availability, mediaOnly, gender, build, hair, eyes, playAge, heightMin, heightMax]);

  const physicalActive = Boolean(gender || build || hair || eyes || playAge || heightMin || heightMax);

  const selected =
    filtered.find((t) => t.id === selectedId) ??
    talents.find((t) => t.id === selectedId) ??
    null;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">
            Casting
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight text-mist md:text-4xl">
            Rechercher des talents
          </h1>
          <p className="mt-2 max-w-xl text-sm text-mist-dim">
            Filtre, consulte la fiche complète (photos, vidéo, bio), puis gère
            les candidatures.
          </p>
        </div>
        <Link
          href="/director"
          className="text-sm font-semibold text-spot hover:underline"
        >
          ← Castings & candidatures
        </Link>
      </motion.div>

      <div className="mt-8 rounded-2xl border border-frame bg-ink-elevated/80 p-4 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, rôle, langue, bio…"
              className="w-full rounded-xl border border-frame bg-lens py-2.5 pr-3 pl-10 text-sm text-mist outline-none focus:border-spot/60"
            />
          </label>
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-mist-dim uppercase">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
          >
            <option value="">Tous les rôles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
          >
            <option value="">Toutes les langues</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={availability}
            onChange={(e) =>
              setAvailability(e.target.value as typeof availability)
            }
            className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
          >
            <option value="all">Toutes dispo</option>
            <option value="available">Disponible</option>
            <option value="limited">Limité</option>
            <option value="booked">Booké</option>
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist">
            <input
              type="checkbox"
              checked={mediaOnly}
              onChange={(e) => setMediaOnly(e.target.checked)}
              className="accent-[var(--spot)]"
            />
            Avec vidéo / photos
          </label>
        </div>

        <p className="mt-5 font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
          Physique du rôle
          {physicalActive && (
            <button
              type="button"
              onClick={() => {
                setGender(""); setBuild(""); setHair(""); setEyes("");
                setPlayAge(""); setHeightMin(""); setHeightMax("");
              }}
              className="ml-3 normal-case tracking-normal text-spot hover:underline"
            >
              Réinitialiser
            </button>
          )}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Tous les genres", gender, setGender, GENDER_OPTIONS],
              ["Toute corpulence", build, setBuild, BUILD_OPTIONS],
              ["Tous cheveux", hair, setHair, HAIR_OPTIONS],
              ["Tous yeux", eyes, setEyes, EYE_OPTIONS],
            ] as const
          ).map(([placeholder, value, set, opts]) => (
            <select
              key={placeholder}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
            >
              <option value="">{placeholder}</option>
              {opts.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
          <input
            type="number"
            min={5}
            max={99}
            value={playAge}
            onChange={(e) => setPlayAge(e.target.value)}
            placeholder="Âge à jouer (ex. 30)"
            className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
          />
          <input
            type="number"
            value={heightMin}
            onChange={(e) => setHeightMin(e.target.value)}
            placeholder="Taille min (cm)"
            className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
          />
          <input
            type="number"
            value={heightMax}
            onChange={(e) => setHeightMax(e.target.value)}
            placeholder="Taille max (cm)"
            className="rounded-xl border border-frame bg-lens px-3 py-2 text-sm text-mist"
          />
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-mist-dim">Chargement des profils…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-spot">{error}</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-mist">Résultats</h2>
              <p className="font-mono text-xs tracking-[0.2em] text-mist-dim uppercase">
                {filtered.length} / {talents.length}
              </p>
            </div>
            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-frame px-5 py-12 text-center text-sm text-mist-dim">
                Aucun talent ne correspond à ces filtres.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((talent, index) => (
                  <TalentCard
                    key={talent.id}
                    talent={talent}
                    index={index}
                    onOpen={() => setSelectedId(talent.id)}
                    selected={selectedId === talent.id}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
            {selected ? (
              <TalentProfilePanel
                talent={selected}
                onClose={() => setSelectedId(null)}
                footer={
                  <Link
                    href="/director"
                    className="block w-full rounded-full bg-spot py-3 text-center text-sm font-semibold text-white hover:bg-[var(--spot-hover)]"
                  >
                    Voir candidatures / castings
                  </Link>
                }
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-frame px-5 py-16 text-center">
                <p className="font-display text-lg text-mist">Consulter un profil</p>
                <p className="mt-2 text-sm text-mist-dim">
                  Clique « Voir fiche » sur une carte pour afficher le dossier
                  complet ici.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/60 p-3 lg:hidden">
          <div className="max-h-[92vh] w-full overflow-hidden">
            <TalentProfilePanel
              talent={selected}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default function DirectorTalentsPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="DIRECTOR">
        <Suspense fallback={<p className="p-12 text-mist-dim">Chargement…</p>}>
          <DirectorTalentsBrowser />
        </Suspense>
      </AuthGate>
    </div>
  );
}
