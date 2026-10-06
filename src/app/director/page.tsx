"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard, Search, Users } from "lucide-react";
import { CastingForm } from "@/components/casting-form";
import { SiteNav } from "@/components/site-nav";
import { TalentProfilePanel } from "@/components/talent-profile-panel";
import { AuthGate } from "@/components/auth-gate";
import {
  apiCreateCasting,
  apiGetApplications,
  apiGetCastings,
  apiUpdateApplicationStatus,
  availabilityFromApi,
  mapCasting,
  type ApiCasting,
} from "@/lib/api-client";
import type { Talent } from "@/lib/types";

type ApplicationRow = Awaited<ReturnType<typeof apiGetApplications>>[number];

function talentFromApplication(app: ApplicationRow): Talent | null {
  if (!app.talent) return null;
  const p = app.talent.talentProfile;
  return {
    id: app.talent.id,
    name: app.talent.name,
    city: p?.city || "",
    roles: (p?.roles || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    languages: (p?.languages || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    tagline: p?.tagline || "",
    bio: p?.bio || undefined,
    availability: availabilityFromApi(p?.availability ?? undefined),
    showreelUrl: p?.showreelUrl || undefined,
    photos: app.talent.portfolioPhotos?.map((ph) => ph.url) ?? [],
    email: app.talent.email,
    phone: p?.phone || undefined,
  };
}

function DirectorWorkspace() {
  const [castings, setCastings] = useState<ApiCasting[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"applications" | "castings">("applications");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "SHORTLISTED" | "REJECTED"
  >("ALL");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, a] = await Promise.all([
        apiGetCastings(true),
        apiGetApplications(),
      ]);
      setCastings(c);
      setApplications(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(input: {
    title: string;
    production: string;
    city: string;
    role: string;
    shootDates: string;
    paid: boolean;
    summary: string;
  }) {
    const casting = await apiCreateCasting(input);
    setCastings((prev) => [casting, ...prev]);
    setTab("castings");
  }

  async function setStatus(
    applicationId: string,
    status: "SHORTLISTED" | "REJECTED" | "PENDING",
  ) {
    await apiUpdateApplicationStatus(applicationId, status);
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a)),
    );
  }

  const filteredApps = useMemo(
    () =>
      applications.filter(
        (a) => statusFilter === "ALL" || a.status === statusFilter,
      ),
    [applications, statusFilter],
  );

  const selectedApp =
    filteredApps.find((a) => a.id === selectedAppId) ??
    applications.find((a) => a.id === selectedAppId) ??
    null;
  const selectedTalent = selectedApp
    ? talentFromApplication(selectedApp)
    : null;

  const shortlistCount = applications.filter(
    (a) => a.status === "SHORTLISTED",
  ).length;

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-12 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
      >
        <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">
          Espace réalisateur
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight text-mist md:text-5xl">
          Castings & candidatures
        </h1>
        <p className="mt-4 max-w-xl text-mist-dim">
          Publie un rôle, reçois des candidatures, ouvre la fiche talent, shortlist.
        </p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/director/talents"
          className="group rounded-2xl border border-frame bg-ink-elevated p-5 transition hover:border-spot/50"
        >
          <Search className="h-5 w-5 text-spot" />
          <p className="font-display mt-3 text-lg text-mist">Chercher des talents</p>
          <p className="mt-1 text-sm text-mist-dim">
            Filtres + fiche complète (photos, vidéo, bio).
          </p>
          <span className="mt-3 inline-block text-sm font-semibold text-spot group-hover:underline">
            Ouvrir →
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setTab("applications")}
          className="rounded-2xl border border-frame bg-ink-elevated p-5 text-left transition hover:border-spot/50"
        >
          <Users className="h-5 w-5 text-spot" />
          <p className="font-display mt-3 text-lg text-mist">Candidatures</p>
          <p className="mt-1 text-sm text-mist-dim">
            {applications.length} reçue{applications.length > 1 ? "s" : ""} ·{" "}
            {shortlistCount} shortlist
          </p>
        </button>
        <button
          type="button"
          onClick={() => setTab("castings")}
          className="rounded-2xl border border-frame bg-ink-elevated p-5 text-left transition hover:border-spot/50"
        >
          <Clapperboard className="h-5 w-5 text-spot" />
          <p className="font-display mt-3 text-lg text-mist">Mes castings</p>
          <p className="mt-1 text-sm text-mist-dim">
            {castings.length} en ligne · publier un rôle
          </p>
        </button>
      </div>

      <div className="flex gap-2 border-b border-frame pb-px">
        {(
          [
            ["applications", "Candidatures"],
            ["castings", "Castings"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
              tab === id
                ? "border-spot text-spot"
                : "border-transparent text-mist-dim hover:text-mist"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-mist-dim">Chargement…</p>
      ) : error ? (
        <p className="text-sm text-spot">{error}</p>
      ) : tab === "castings" ? (
        <div className="space-y-10">
          <CastingForm onCreate={onCreate} />
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl text-mist">Tes castings</h2>
              <p className="text-xs tracking-[0.25em] text-mist-dim uppercase">
                {castings.length} en ligne
              </p>
            </div>
            {castings.length === 0 ? (
              <p className="text-sm text-mist-dim">
                Aucun casting — publie ton premier rôle ci-dessus.
              </p>
            ) : (
              <ul className="grid gap-3">
                {castings.map((row) => {
                  const casting = mapCasting(row);
                  return (
                    <li
                      key={casting.id}
                      className="flex flex-col gap-1 rounded-xl border border-frame bg-ink-elevated px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-display text-lg text-mist">
                          {casting.title}
                        </p>
                        <p className="text-sm text-mist-dim">
                          {casting.role} · {casting.city}
                          {row._count
                            ? ` · ${row._count.applications} candidature(s)`
                            : ""}
                        </p>
                      </div>
                      <span className="text-xs tracking-[0.2em] text-spot uppercase">
                        {casting.paid ? "Payé" : "Bénévolat"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
          <section>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {(
                [
                  ["ALL", "Toutes"],
                  ["PENDING", "En attente"],
                  ["SHORTLISTED", "Shortlist"],
                  ["REJECTED", "Refusées"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStatusFilter(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    statusFilter === id
                      ? "bg-spot text-white"
                      : "border border-frame text-mist-dim"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredApps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-frame px-5 py-12 text-center">
                <p className="text-sm text-mist-dim">
                  {applications.length === 0
                    ? "Pas encore de candidatures. Publie un casting, ou cherche des talents."
                    : "Aucune candidature dans ce filtre."}
                </p>
                <Link
                  href="/director/talents"
                  className="mt-4 inline-block text-sm font-semibold text-spot"
                >
                  Rechercher des talents →
                </Link>
              </div>
            ) : (
              <ul className="grid gap-3">
                {filteredApps.map((app) => {
                  const talent = talentFromApplication(app);
                  const active = selectedAppId === app.id;
                  return (
                    <li key={app.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedAppId(app.id)}
                        className={`w-full rounded-xl border px-5 py-4 text-left shadow-sm transition ${
                          active
                            ? "border-spot bg-spot/10"
                            : "border-frame bg-ink-elevated hover:border-spot/40"
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex gap-3">
                            {talent?.photos?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={talent.photos[0]}
                                alt=""
                                className="size-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="grid size-14 place-items-center rounded-lg bg-lens text-[10px] text-mist-dim uppercase">
                                Profil
                              </div>
                            )}
                            <div>
                              <p className="font-display text-lg text-mist">
                                {app.talent?.name ?? "Talent"}
                              </p>
                              <p className="text-sm text-mist-dim">
                                {app.casting.title} · {app.casting.role}
                              </p>
                              <p className="mt-1 text-[11px] tracking-wider text-spot uppercase">
                                {app.status}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-spot">
                            Consulter →
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            {selectedTalent && selectedApp ? (
              <TalentProfilePanel
                talent={selectedTalent}
                castingHint={selectedApp.casting.title}
                onClose={() => setSelectedAppId(null)}
                footer={
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-mist-dim">
                      Candidature · {selectedApp.casting.title}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void setStatus(selectedApp.id, "SHORTLISTED")
                        }
                        className="flex-1 rounded-full border border-spot/40 bg-spot/10 px-4 py-2.5 text-xs font-semibold text-spot"
                      >
                        Shortlist
                      </button>
                      <button
                        type="button"
                        onClick={() => void setStatus(selectedApp.id, "REJECTED")}
                        className="flex-1 rounded-full border border-frame px-4 py-2.5 text-xs font-semibold text-mist-dim"
                      >
                        Refuser
                      </button>
                    </div>
                    <Link
                      href={`/director/talents?id=${selectedTalent.id}`}
                      className="text-center text-xs font-semibold text-spot"
                    >
                      Ouvrir dans Recherche talents →
                    </Link>
                  </div>
                }
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-frame px-5 py-14 text-center">
                <p className="font-display text-lg text-mist">Fiche candidature</p>
                <p className="mt-2 text-sm text-mist-dim">
                  Sélectionne une candidature pour voir le profil complet et
                  shortlister.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default function DirectorPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="DIRECTOR">
        <DirectorWorkspace />
      </AuthGate>
    </div>
  );
}
