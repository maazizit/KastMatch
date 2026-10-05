/** Motif viseur / grille cinéma — filigrane léger pour encarts sombres. */
export function CinemaWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="km-viewfinder"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 20 H12 M0 20 V32 M68 20 H80 M80 20 V32 M0 60 H12 M0 48 V60 M68 60 H80 M80 48 V60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="40"
            cy="40"
            r="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.7"
          />
          <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.8" />
          <path
            d="M20 40 H28 M52 40 H60 M40 20 V28 M40 52 V60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.55"
          />
        </pattern>
      </defs>
      <rect width="800" height="400" fill="url(#km-viewfinder)" />
      {/* Clap stylisé discret */}
      <g opacity="0.45" transform="translate(620,40) rotate(-12)">
        <rect
          x="0"
          y="28"
          width="120"
          height="56"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 28 L28 8 H128 L108 28 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M36 8 L52 28 M64 8 L80 28 M92 8 L108 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}
