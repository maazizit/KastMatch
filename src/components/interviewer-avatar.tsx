"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { SoundWaves } from "./sound-waves";

export type InterviewerAvatarState =
  | "speaking"
  | "listening"
  | "idle"
  | "thinking";

type Props = {
  name?: string;
  state: InterviewerAvatarState;
  layout?: "card" | "stage";
  className?: string;
};

const VIDEO_SRC = "/test-avatar.mp4";
const POSTER_SRC = "/test-avatar.jpeg";

const STATE_LABEL: Record<InterviewerAvatarState, string> = {
  speaking: "Parle",
  listening: "Écoute",
  idle: "En plateau",
  thinking: "Analyse…",
};

function playSafely(video: HTMLVideoElement | null) {
  void video?.play().catch(() => {
    /* autoplay policies */
  });
}

export function InterviewerAvatar({
  name = "Kast",
  state,
  layout = "card",
  className,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || videoUnavailable) return;
    const video = videoRef.current;
    if (!video) return;
    if (state === "idle" || state === "listening" || state === "speaking") {
      playSafely(video);
    } else {
      video.pause();
    }
  }, [state, reduceMotion, videoUnavailable]);

  return (
    <figure
      className={cn(
        "m-0 flex w-full flex-col items-center gap-2",
        layout === "stage" && "h-full justify-center",
        className,
      )}
      data-state={state}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-gradient-to-b from-[#eceef4] to-[#c9cde0]",
          layout === "card" && "aspect-[4/5] rounded-2xl",
          layout === "stage" && "aspect-video max-h-[min(52vh,420px)] rounded-2xl",
        )}
        role="img"
        aria-label={`${name} — ${STATE_LABEL[state]}`}
      >
        {reduceMotion || videoUnavailable ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={POSTER_SRC}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-[center_20%]",
              state === "speaking" && "animate-[speakBob_0.4s_ease-in-out_infinite]",
              state === "listening" && "animate-[listenNod_2.2s_ease-in-out_infinite]",
              (state === "idle" || state === "thinking") &&
                "animate-[idleBreath_3.4s_ease-in-out_infinite]",
            )}
          />
        ) : (
          <video
            ref={videoRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-[center_20%]",
              state === "speaking" && "animate-[speakBob_0.4s_ease-in-out_infinite]",
              state === "listening" && "animate-[listenNod_2.2s_ease-in-out_infinite]",
              state === "idle" && "animate-[idleBreath_3.4s_ease-in-out_infinite]",
            )}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted
            playsInline
            loop
            preload="auto"
            aria-hidden
            onError={() => setVideoUnavailable(true)}
          />
        )}

        <span className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
          AI
        </span>

        {state === "speaking" && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-spot px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}

        {state === "listening" && (
          <span className="absolute top-3 left-3 rounded-full bg-flare px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
            À toi
          </span>
        )}
      </div>
      <figcaption className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-mist">
        <span>
          {name} · {STATE_LABEL[state]}
        </span>
        {(state === "speaking" || state === "listening") && (
          <SoundWaves
            active
            className={state === "speaking" ? "text-spot" : "text-flare"}
          />
        )}
      </figcaption>
    </figure>
  );
}
