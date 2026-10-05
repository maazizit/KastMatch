"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CastingForm } from "@/components/casting-form";
import { SiteNav } from "@/components/site-nav";
import { TalentCard } from "@/components/talent-card";
import { AuthGate } from "@/components/auth-gate";
import {
  apiCreateCasting,
  apiGetApplications,
  apiGetCastings,
  apiGetTalents,
  apiUpdateApplicationStatus,
  mapCasting,
  mapTalent,
  type ApiCasting,
} from "@/lib/api-client";
import type { Talent } from "@/lib/types";

type ApplicationRow = Awaited<ReturnType<typeof apiGetApplications>>[number];

function DirectorWorkspace() {
  const [castings, setCastings] = useState<ApiCasting[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, t, a] = await Promise.all([
        apiGetCastings(true),
        apiGetTalents(),
        apiGetApplications(),
      ]);
      setCastings(c);
      setTalents(t.map(mapTalent));
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

  return (
    <main className="mx-auto max-w-6xl space-y-14 px-6 py-12 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
      >
        <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">
          Espace réalisateur
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight text-mist md:text-5xl">
          Cast & shortlist
        </h1>
        <p className="mt-4 max-w-xl text-mist-dim">
          Publie un casting, explore les talents, shortlist les candidatures.
        </p>
        <Link
          href="/director/dashboard"
          className="mt-5 inline-flex text-sm font-semibold text-spot"
        >
          Ouvrir le dashboard IA →
        </Link>
      </motion.div>

      <CastingForm onCreate={onCreate} />

      {loading ? (
        <p className="text-mist-dim">Chargement…</p>
      ) : error ? (
        <p className="text-sm text-spot">{error}</p>
      ) : (
        <>
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

          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl text-mist">Candidatures</h2>
              <p className="text-xs tracking-[0.25em] text-mist-dim uppercase">
                {applications.filter((a) => a.status === "SHORTLISTED").length}{" "}
                shortlist
              </p>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-mist-dim">
                Pas encore de candidatures sur tes castings.
              </p>
            ) : (
              <ul className="grid gap-3">
                {applications.map((app) => (
                  <li
                    key={app.id}
                    className="rounded-xl border border-frame bg-ink-elevated px-5 py-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void setStatus(app.id, "SHORTLISTED")}
                          className="rounded-full border border-spot/40 bg-spot/10 px-4 py-2 text-xs font-semibold text-spot"
                        >
                          Shortlist
                        </button>
                        <button
                          type="button"
                          onClick={() => void setStatus(app.id, "REJECTED")}
                          className="rounded-full border border-frame px-4 py-2 text-xs font-semibold text-mist-dim"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl text-mist">Talents</h2>
              <p className="text-xs tracking-[0.25em] text-mist-dim uppercase">
                {talents.length} profils
              </p>
            </div>
            {talents.length === 0 ? (
              <p className="text-sm text-mist-dim">Aucun talent inscrit.</p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {talents.map((talent, index) => (
                  <TalentCard key={talent.id} talent={talent} index={index} />
                ))}
              </div>
            )}
          </section>
        </>
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
