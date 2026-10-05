"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CastingCard } from "@/components/casting-card";
import { SiteNav } from "@/components/site-nav";
import { AuthGate } from "@/components/auth-gate";
import {
  apiApply,
  apiGetCastings,
  mapCasting,
  type ApiCasting,
} from "@/lib/api-client";

function TalentCastings() {
  const [rows, setRows] = useState<ApiCasting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRows(await apiGetCastings(false));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function apply(id: string, title: string) {
    setBusyId(id);
    try {
      await apiApply(id);
      setRows((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                applications: [{ id: "local", status: "PENDING" }],
              }
            : c,
        ),
      );
      setToast(`Candidature envoyée · ${title}`);
      window.setTimeout(() => setToast(null), 2400);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Échec candidature");
      window.setTimeout(() => setToast(null), 2800);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <p className="font-display text-sm tracking-[0.35em] text-spot uppercase">
            Espace talent
          </p>
          <h1 className="font-display mt-3 text-4xl tracking-tight text-mist md:text-5xl">
            Castings ouverts
          </h1>
          <p className="mt-4 max-w-xl text-mist-dim">
            Parcours les offres et postule. Prépare d’abord ton dossier dans
            l’espace perso pour que les réalisateurs te reconnaissent.
          </p>
          <Link
            href="/talent/agents"
            className="mt-6 inline-flex rounded-full border border-spot/40 bg-spot/10 px-5 py-2.5 text-sm font-semibold text-spot transition hover:bg-spot hover:text-white"
          >
            Préparer avec les agents →
          </Link>
        </motion.div>

        {loading ? (
          <p className="mt-12 text-mist-dim">Chargement des castings…</p>
        ) : error ? (
          <p className="mt-12 text-sm text-spot">{error}</p>
        ) : rows.length === 0 ? (
          <p className="mt-12 text-mist-dim">
            Aucun casting ouvert pour le moment.
          </p>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row, index) => {
              const casting = mapCasting(row);
              const applied = (row.applications?.length ?? 0) > 0;
              return (
                <CastingCard
                  key={casting.id}
                  casting={casting}
                  index={index}
                  actionLabel={
                    applied
                      ? "Déjà postulé"
                      : busyId === casting.id
                        ? "Envoi…"
                        : "Postuler"
                  }
                  actionDisabled={applied || busyId === casting.id}
                  onAction={() => void apply(casting.id, casting.title)}
                />
              );
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-spot/40 bg-ink-elevated px-5 py-3 text-sm text-spot shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function TalentPage() {
  return (
    <div className="cinema-stage min-h-[100svh]">
      <SiteNav />
      <AuthGate role="TALENT">
        <TalentCastings />
      </AuthGate>
    </div>
  );
}
