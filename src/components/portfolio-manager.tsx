"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import {
  apiDeletePortfolioPhoto,
  apiGetPortfolio,
  apiUploadPortfolioPhoto,
  type PortfolioPhoto,
} from "@/lib/api-client";
import { PORTFOLIO_LIMITS } from "@/lib/storage/limits";

const MAX = PORTFOLIO_LIMITS.maxPhotos;
const MAX_SIDE = 1600;

/** Redimensionne + convertit en WebP côté navigateur : ~300 Ko au lieu de plusieurs Mo. */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.82));
  if (!blob) throw new Error("Compression impossible");
  return blob;
}

export function PortfolioManager() {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGetPortfolio()
      .then(setPhotos)
      .catch((e) => setError(e instanceof Error ? e.message : "Chargement impossible"));
  }, []);

  const remaining = MAX - photos.length;

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      const picked = Array.from(files).slice(0, remaining);
      if (files.length > remaining) {
        setError(`Maximum ${MAX} photos : seules ${remaining} ont été ajoutées.`);
      }
      for (const file of picked) {
        if (!file.type.startsWith("image/")) {
          setError("Seules les images sont acceptées.");
          continue;
        }
        const blob = await compress(file);
        const photo = await apiUploadPortfolioPhoto(blob);
        setPhotos((prev) => [...prev, photo]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload échoué");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await apiDeletePortfolioPhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression échouée");
    }
  }

  return (
    <div className="rounded-2xl border border-frame bg-ink-elevated p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">Portfolio</p>
          <p className="mt-1 text-sm text-mist-dim">
            Jusqu&apos;à {MAX} photos — compressées automatiquement.
          </p>
        </div>
        <p className="font-mono text-sm text-mist tabular-nums">
          <span className={photos.length >= MAX ? "text-spot" : ""}>{photos.length}</span>/{MAX}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <AnimatePresence>
          {photos.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-frame bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="Photo du portfolio" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => void remove(p.id)}
                aria-label="Supprimer la photo"
                className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-mist opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-spot focus:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {remaining > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void addFiles(e.dataTransfer.files);
            }}
            className="grid aspect-[3/4] place-items-center rounded-lg border border-dashed border-mist/25 text-mist-dim transition hover:border-spot hover:text-spot disabled:opacity-60"
          >
            <span className="flex flex-col items-center gap-2 text-xs">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              {busy ? "Envoi…" : "Ajouter"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => void addFiles(e.target.files)}
      />
      {remaining === 0 && (
        <p className="mt-3 text-xs text-mist-dim">Limite atteinte — supprime une photo pour en ajouter une autre.</p>
      )}
      {error && <p className="mt-3 text-sm text-spot">{error}</p>}
    </div>
  );
}
