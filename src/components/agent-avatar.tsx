"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  /** Point REC rouge (caméra) — pas le vert type Slack. */
  rec?: boolean;
  className?: string;
  speaking?: boolean;
};

const VIDEO_SRC = "/test-avatar.mp4";
const POSTER_SRC = "/test-avatar.jpeg";

/** Avatar agent circulaire — même média que les tests visio. */
export function AgentAvatar({
  size = 112,
  rec = true,
  className,
  speaking = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || failed) return;
    void v.play().catch(() => {});
  }, [failed, speaking]);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="relative overflow-hidden rounded-full border-4 border-ink-elevated bg-lens shadow-lg"
        style={{ width: size, height: size }}
      >
        {failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={POSTER_SRC}
            alt=""
            className="h-full w-full object-cover object-[center_18%]"
          />
        ) : (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted
            playsInline
            loop
            className={cn(
              "h-full w-full object-cover object-[center_18%]",
              speaking && "animate-[speakBob_0.4s_ease-in-out_infinite]",
            )}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      {rec && (
        <span
          className="absolute right-1 bottom-1 flex size-4 items-center justify-center rounded-full border-[3px] border-ink-elevated bg-spot shadow-[0_0_0_1px_rgba(0,0,0,.15)]"
          aria-label="REC"
          title="REC"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-white" />
        </span>
      )}
    </div>
  );
}
