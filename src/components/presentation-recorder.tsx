"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Circle, RotateCcw, Square, Upload, Video, VideoOff } from "lucide-react";
import { VIDEO_LIMITS } from "@/lib/storage/limits";
import { cn } from "@/lib/cn";

type Phase = "idle" | "ready" | "recording" | "review" | "uploading" | "done";

type Props = {
  value?: string;
  onSaved: (url: string) => void;
  onCleared?: () => void;
  className?: string;
};

function pickMimeType() {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

export function PresentationRecorder({
  value,
  onSaved,
  onCleared,
  className,
}: Props) {
  const liveRef = useRef<HTMLVideoElement>(null);
  const reviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>(value ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blobType, setBlobType] = useState("video/webm");
  const [savedUrl, setSavedUrl] = useState<string | undefined>(value);

  useEffect(() => {
    setSavedUrl(value);
    if (value) setPhase("done");
  }, [value]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attache le flux live une fois la balise <video> montée
  useEffect(() => {
    if (phase !== "ready" && phase !== "recording") return;
    const el = liveRef.current;
    const stream = streamRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.muted = true;
    void el.play().catch(() => {});
  }, [phase]);

  // Preview après Stop
  useEffect(() => {
    if (phase !== "review" || !previewUrl) return;
    const el = reviewRef.current;
    if (!el) return;
    el.src = previewUrl;
    el.muted = false;
    void el.play().catch(() => {});
  }, [phase, previewUrl]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (liveRef.current) liveRef.current.srcObject = null;
  }

  async function openCamera() {
    setError(null);
    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setSeconds(0);
      setPhase("ready");
    } catch {
      setError("Caméra / micro refusés. Autorise l’accès dans le navigateur.");
      setPhase("idle");
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = pickMimeType();
    if (!mimeType) {
      setError("Enregistrement vidéo non supporté sur ce navigateur.");
      return;
    }
    chunksRef.current = [];
    setBlobType(mimeType.split(";")[0] || "video/webm");
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2_500_000,
    });
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = mimeType.split(";")[0] || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      stopCamera();
      setPhase("review");
    };
    recorder.start(250);
    setPhase("recording");
    setSeconds(0);
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= VIDEO_LIMITS.maxDurationSec) {
          stopRecording();
        }
        return next;
      });
    }, 1000);
  }

  function stopRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  async function validateAndUpload() {
    if (chunksRef.current.length === 0) return;
    setPhase("uploading");
    setError(null);
    try {
      const blob = new Blob(chunksRef.current, { type: blobType });
      if (blob.size > VIDEO_LIMITS.maxBytes) {
        throw new Error("Vidéo trop lourde (max 40 Mo). Raccourcis un peu.");
      }

      // 1) Essaye upload direct R2 (présigné)
      const presignRes = await fetch("/api/videos/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: blobType }),
      });
      const presign = (await presignRes.json()) as {
        ok: boolean;
        uploadUrl?: string;
        key?: string;
        publicUrl?: string;
        fallback?: string;
        error?: string;
      };

      let finalUrl: string | undefined;

      if (presignRes.ok && presign.ok && presign.uploadUrl && presign.key && presign.publicUrl) {
        const put = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": blobType },
          body: blob,
        });
        if (!put.ok) {
          throw new Error("Échec envoi vers Cloudflare R2");
        }
        const completeRes = await fetch("/api/videos/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: presign.key,
            publicUrl: presign.publicUrl,
          }),
        });
        const complete = (await completeRes.json()) as {
          ok: boolean;
          url?: string;
          error?: string;
        };
        if (!completeRes.ok || !complete.ok || !complete.url) {
          throw new Error(complete.error ?? "Finalisation échouée");
        }
        finalUrl = complete.url;
      } else {
        // 2) Fallback local (dev sans R2)
        const form = new FormData();
        form.append(
          "video",
          blob,
          `presentation.${blobType.includes("mp4") ? "mp4" : "webm"}`,
        );
        const res = await fetch("/api/videos/presentation", {
          method: "POST",
          body: form,
        });
        const data = (await res.json()) as {
          ok: boolean;
          url?: string;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.url) {
          throw new Error(data.error ?? "Upload échoué");
        }
        finalUrl = data.url;
      }

      setSavedUrl(finalUrl);
      onSaved(finalUrl);
      setPhase("done");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      chunksRef.current = [];
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload échoué");
      setPhase("review");
    }
  }

  function rerecord() {
    chunksRef.current = [];
    setSeconds(0);
    void openCamera();
  }

  async function clearVideo() {
    try {
      await fetch("/api/videos/presentation", { method: "DELETE" });
    } catch {
      /* guest ok */
    }
    setSavedUrl(undefined);
    onCleared?.();
    setPhase("idle");
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-frame bg-ink text-white",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-spot" />
          <span className="text-sm font-semibold">Vidéo de présentation</span>
        </div>
        <span className="text-[10px] tracking-wider text-white/55 uppercase">
          Max {VIDEO_LIMITS.maxDurationSec}s · 720p
        </span>
      </div>

      <div className="relative aspect-video bg-[#0c0c10]">
        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/60">
            <VideoOff className="h-8 w-8" />
            <p className="px-6 text-center text-sm">
              Présente-toi face caméra — les réalisateurs verront cette vidéo
              sur ton profil.
            </p>
          </div>
        )}

        {phase === "done" && savedUrl && (
          <video
            key={savedUrl}
            src={savedUrl}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        )}

        {(phase === "ready" || phase === "recording") && (
          <video
            ref={liveRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {(phase === "review" || phase === "uploading") && (
          <video
            ref={reviewRef}
            playsInline
            controls={phase === "review"}
            className="h-full w-full object-cover"
          />
        )}

        {phase === "recording" && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-spot px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            REC {mm}:{ss}
          </div>
        )}

        {phase === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold">
            Enregistrement sur KastMatch…
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        {phase === "idle" && (
          <button
            type="button"
            onClick={() => void openCamera()}
            className="inline-flex items-center gap-2 rounded-full bg-spot px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--spot-hover)]"
          >
            <Circle className="h-4 w-4 fill-current" />
            Ouvrir la caméra
          </button>
        )}

        {phase === "ready" && (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-2 rounded-full bg-spot px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Circle className="h-4 w-4 fill-current" />
            Enregistrer
          </button>
        )}

        {phase === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </button>
        )}

        {phase === "review" && (
          <>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => void validateAndUpload()}
              className="inline-flex items-center gap-2 rounded-full bg-spot px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Upload className="h-4 w-4" />
              Valider & publier
            </motion.button>
            <button
              type="button"
              onClick={rerecord}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/90"
            >
              <RotateCcw className="h-4 w-4" />
              Reprendre
            </button>
          </>
        )}

        {phase === "done" && savedUrl && (
          <>
            <button
              type="button"
              onClick={rerecord}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/90"
            >
              <RotateCcw className="h-4 w-4" />
              Nouvelle prise
            </button>
            <button
              type="button"
              onClick={() => void clearVideo()}
              className="text-sm text-white/55 underline-offset-2 hover:text-white hover:underline"
            >
              Retirer
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="border-t border-white/10 px-4 py-2 text-xs text-flare">
          {error}
        </p>
      )}
    </div>
  );
}
