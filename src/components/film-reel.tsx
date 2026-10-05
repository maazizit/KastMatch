"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect } from "react";
import { Portrait } from "./portrait";

const FRAMES = [
  { label: "Lead · drama", tone: "red", sc: "SC. 04" },
  { label: "Voice · AR/FR", tone: "gold", sc: "SC. 11" },
  { label: "Stunt · action", tone: "teal", sc: "SC. 07" },
] as const;

/** Pile de plans de film en parallaxe, qui réagit à la souris. */
export function FilmReel() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52vw] md:block"
      aria-hidden
    >
      {FRAMES.map((f, i) => (
        <Frame key={f.label} frame={f} index={i} sx={sx} sy={sy} />
      ))}
    </div>
  );
}

const POS = [
  { top: "14%", right: "30%", w: 270, r: -6 },
  { top: "30%", right: "6%", w: 250, r: 5 },
  { top: "54%", right: "24%", w: 230, r: -2 },
];

function Frame({
  frame: f,
  index: i,
  sx,
  sy,
}: {
  frame: (typeof FRAMES)[number];
  index: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
}) {
  const x = useTransform(sx, [-0.5, 0.5], [-14 * (i + 1), 14 * (i + 1)]);
  const y = useTransform(sy, [-0.5, 0.5], [-10 * (i + 1), 10 * (i + 1)]);
  const pos = POS[i];
  return (
    <motion.figure
      style={{ x, y, top: pos.top, right: pos.right, width: pos.w, rotate: pos.r }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.5 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute overflow-hidden rounded-sm border border-white/10 bg-black shadow-[0_30px_80px_-20px_#000]"
    >
      {(["left-0", "right-0"] as const).map((side) => (
        <div key={side} className={`absolute inset-y-0 ${side} z-10 flex w-4 flex-col justify-between bg-black py-2`}>
          {Array.from({ length: 9 }).map((_, h) => (
            <span key={h} className="mx-auto h-2 w-2 rounded-[2px] bg-[#26262b]" />
          ))}
        </div>
      ))}
      <Portrait tone={f.tone} seed={i} className="aspect-[3/4] w-full" />
      <figcaption className="absolute inset-x-6 bottom-3 z-10 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[#f3ebdd] uppercase">
        <span>{f.label}</span>
        <span className="text-spot">{f.sc}</span>
      </figcaption>
    </motion.figure>
  );
}
