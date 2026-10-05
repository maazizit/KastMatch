/** Portrait stylisé (silhouette éclairée) — placeholder cinématographique sans image externe. */
type Props = {
  tone?: "red" | "gold" | "teal" | "ivory";
  className?: string;
  seed?: number;
};

const tones = {
  red: ["#3b0a14", "#e11d48", "#ff9bb0"],
  gold: ["#2a2010", "#e3c27d", "#fff1cf"],
  teal: ["#06231f", "#4fd1b8", "#c8fff4"],
  ivory: ["#1a1a1c", "#9a968d", "#f3ebdd"],
} as const;

export function Portrait({ tone = "red", className, seed = 0 }: Props) {
  const [dark, mid, light] = tones[tone];
  const id = `pt-${tone}-${seed}`;
  const shift = (seed % 3) * 8 - 8;
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx={`${60 + shift}%`} cy="22%" r="85%">
          <stop offset="0" stopColor={mid} stopOpacity="0.85" />
          <stop offset="0.55" stopColor={dark} />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.92" />
          <stop offset="0.65" stopColor="#000" stopOpacity="0.8" />
          <stop offset="1" stopColor={light} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill={`url(#${id}-bg)`} />
      <g transform={`translate(${shift} 0)`}>
        <ellipse cx="150" cy="150" rx="58" ry="72" fill={`url(#${id}-rim)`} />
        <path
          d="M30 400 C30 300 90 258 150 258 C210 258 270 300 270 400 Z"
          fill={`url(#${id}-rim)`}
        />
        <path d="M208 100 C222 130 214 190 190 218" stroke={light} strokeOpacity="0.5" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
}
