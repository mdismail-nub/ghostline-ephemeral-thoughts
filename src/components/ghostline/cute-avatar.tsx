import { useMemo } from "react";

interface CuteAvatarProps {
  alias: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showSparkle?: boolean;
}

interface Palette {
  bg: string;
  border: string;
  ink: string;
  blush: string;
  accent: string;
}

const PALETTES: Palette[] = [
  // Lavender
  {
    bg: "oklch(0.95 0.035 295)",
    border: "oklch(0.88 0.06 295)",
    ink: "oklch(0.48 0.15 295)",
    blush: "oklch(0.85 0.1 350)",
    accent: "oklch(0.75 0.12 295)",
  },
  // Peach
  {
    bg: "oklch(0.96 0.04 55)",
    border: "oklch(0.89 0.07 55)",
    ink: "oklch(0.5 0.14 55)",
    blush: "oklch(0.85 0.12 25)",
    accent: "oklch(0.78 0.11 55)",
  },
  // Mint
  {
    bg: "oklch(0.95 0.035 164)",
    border: "oklch(0.88 0.06 164)",
    ink: "oklch(0.45 0.12 164)",
    blush: "oklch(0.86 0.1 350)",
    accent: "oklch(0.75 0.1 164)",
  },
  // Rose / Pink
  {
    bg: "oklch(0.95 0.04 350)",
    border: "oklch(0.88 0.07 350)",
    ink: "oklch(0.48 0.16 350)",
    blush: "oklch(0.84 0.12 350)",
    accent: "oklch(0.76 0.14 350)",
  },
  // Sky
  {
    bg: "oklch(0.95 0.035 230)",
    border: "oklch(0.87 0.06 230)",
    ink: "oklch(0.46 0.13 230)",
    blush: "oklch(0.85 0.1 350)",
    accent: "oklch(0.74 0.12 230)",
  },
  // Honey / Butter
  {
    bg: "oklch(0.96 0.045 85)",
    border: "oklch(0.89 0.08 85)",
    ink: "oklch(0.52 0.13 75)",
    blush: "oklch(0.86 0.12 30)",
    accent: "oklch(0.78 0.13 85)",
  },
  // Lilac
  {
    bg: "oklch(0.95 0.038 315)",
    border: "oklch(0.87 0.07 315)",
    ink: "oklch(0.48 0.15 315)",
    blush: "oklch(0.85 0.1 350)",
    accent: "oklch(0.76 0.13 315)",
  },
  // Blossom
  {
    bg: "oklch(0.95 0.035 330)",
    border: "oklch(0.88 0.065 330)",
    ink: "oklch(0.47 0.15 330)",
    blush: "oklch(0.85 0.11 350)",
    accent: "oklch(0.75 0.12 330)",
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarPalette(alias: string) {
  const safeAlias = alias || "Ghostie";
  const h = hashString(safeAlias);
  const p = PALETTES[h % PALETTES.length] ?? PALETTES[0]!;
  // Provide hex/rgb fallbacks for canvas rendering
  const hexFallbacks = [
    { bg: "#F5EEFD", border: "#E4D0FC", ink: "#7E22CE", ring: "#D8B4FE", accent: "#A855F7" },
    { bg: "#FFF4ED", border: "#FED7AA", ink: "#C2410C", ring: "#FDBA74", accent: "#FB923C" },
    { bg: "#F0FDF4", border: "#BBF7D0", ink: "#15803D", ring: "#86EFAC", accent: "#4ADE80" },
    { bg: "#FFF1F2", border: "#FECDD3", ink: "#BE123C", ring: "#FDA4AF", accent: "#FB7185" },
    { bg: "#F0F9FF", border: "#BAE6FD", ink: "#0369A1", ring: "#7DD3FC", accent: "#38BDF8" },
    { bg: "#FEFCE8", border: "#FEF08A", ink: "#A16207", ring: "#FDE047", accent: "#FACC15" },
    { bg: "#FAF5FF", border: "#E9D5FF", ink: "#7E22CE", ring: "#D8B4FE", accent: "#C084FC" },
    { bg: "#FDF2F8", border: "#FBCFE8", ink: "#BE185D", ring: "#F472B6", accent: "#EC4899" },
  ];
  const fb = hexFallbacks[h % hexFallbacks.length] ?? hexFallbacks[0]!;
  return {
    ...p,
    ...fb,
  };
}

export function CuteAvatar({
  alias,
  size = "md",
  className = "",
  showSparkle = true,
}: CuteAvatarProps) {
  const { palette, motifIndex } = useMemo(() => {
    const safeAlias = alias || "Ghostie";
    const h = hashString(safeAlias);
    const p = PALETTES[h % PALETTES.length] ?? PALETTES[0]!;
    const m = (h >> 3) % 7;
    return { palette: p, motifIndex: m };
  }, [alias]);

  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  }[size];

  const iconSize = {
    xs: 18,
    sm: 24,
    md: 28,
    lg: 34,
    xl: 40,
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl shrink-0 transition-transform duration-200 select-none ${sizeClasses} ${className}`}
      style={{
        backgroundColor: palette.bg,
        border: `1.5px solid ${palette.border}`,
        color: palette.ink,
      }}
      title={alias}
      aria-label={`${alias}'s avatar`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        aria-hidden="true"
      >
        {motifIndex === 0 && (
          // 1. Cozy Ghost with blushing cheeks and smile
          <g>
            <path
              d="M7 25V13a9 9 0 0 1 18 0v12l-3.5-1.8-2.5 2.5-3-2-3 2-2.5-2.5L7 25Z"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Kawaii Eyes */}
            <circle cx="12" cy="14" r="1.4" fill={palette.ink} />
            <circle cx="20" cy="14" r="1.4" fill={palette.ink} />
            {/* Blushing Cheeks */}
            <circle cx="10" cy="16.5" r="1.6" fill={palette.blush} opacity="0.8" />
            <circle cx="22" cy="16.5" r="1.6" fill={palette.blush} opacity="0.8" />
            {/* Sweet Smile */}
            <path
              d="M14.5 17.5c.8 1 2.2 1 3 0"
              stroke={palette.ink}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {motifIndex === 1 && (
          // 2. Cozy Bunny with sweet ears
          <g>
            {/* Left Ear */}
            <path
              d="M10 13C8 6 11 4 13 8l1 6"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Right Ear */}
            <path
              d="M22 13C24 6 21 4 19 8l-1 6"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Head */}
            <ellipse
              cx="16"
              cy="18"
              rx="9"
              ry="7.5"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
            />
            {/* Eyes */}
            <circle cx="12.5" cy="17" r="1.3" fill={palette.ink} />
            <circle cx="19.5" cy="17" r="1.3" fill={palette.ink} />
            {/* Blush */}
            <circle cx="10.5" cy="19.5" r="1.5" fill={palette.blush} opacity="0.8" />
            <circle cx="21.5" cy="19.5" r="1.5" fill={palette.blush} opacity="0.8" />
            {/* Nose/Mouth */}
            <path
              d="M15 19.5h2M16 19.5v1.2m-1 0c.5.5 1.5.5 2 0"
              stroke={palette.ink}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        )}

        {motifIndex === 2 && (
          // 3. Sleepy Boba / Sweet Cup
          <g>
            {/* Straw */}
            <path d="M18 5l-2 6" stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" />
            {/* Cup */}
            <path
              d="M8 12h16l-2 13a3 3 0 0 1-3 2.5h-6A3 3 0 0 1 10 25L8 12Z"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Lid */}
            <path
              d="M7 12c0-1.5 2-2.5 9-2.5s9 1 9 2.5H7Z"
              fill={palette.accent}
              stroke={palette.ink}
              strokeWidth="1.6"
            />
            {/* Happy Eyes */}
            <path
              d="M12 17c.5-.8 1.5-.8 2 0m4 0c.5-.8 1.5-.8 2 0"
              stroke={palette.ink}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Smile */}
            <path
              d="M15 20c.5.6 1.5.6 2 0"
              stroke={palette.ink}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Boba pearls */}
            <circle cx="12" cy="24" r="1.2" fill={palette.ink} />
            <circle cx="16" cy="24.5" r="1.2" fill={palette.ink} />
            <circle cx="20" cy="24" r="1.2" fill={palette.ink} />
          </g>
        )}

        {motifIndex === 3 && (
          // 4. Fluffy Cloud
          <g>
            <path
              d="M10 23h12a5 5 0 0 0 1.5-9.8A6 6 0 0 0 12 11.5a5 5 0 0 0-4.5 4.5A4.5 4.5 0 0 0 10 23Z"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Eyes */}
            <circle cx="13" cy="18" r="1.3" fill={palette.ink} />
            <circle cx="19" cy="18" r="1.3" fill={palette.ink} />
            {/* Blush */}
            <circle cx="11" cy="19.5" r="1.4" fill={palette.blush} opacity="0.8" />
            <circle cx="21" cy="19.5" r="1.4" fill={palette.blush} opacity="0.8" />
            {/* Smile */}
            <path
              d="M15 19.5c.6.7 1.4.7 2 0"
              stroke={palette.ink}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        )}

        {motifIndex === 4 && (
          // 5. Cozy Bear / Panda
          <g>
            {/* Left Ear */}
            <circle
              cx="10"
              cy="11"
              r="3.5"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
            />
            {/* Right Ear */}
            <circle
              cx="22"
              cy="11"
              r="3.5"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
            />
            {/* Head */}
            <circle
              cx="16"
              cy="18"
              r="8"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
            />
            {/* Eyes */}
            <circle cx="13" cy="17" r="1.3" fill={palette.ink} />
            <circle cx="19" cy="17" r="1.3" fill={palette.ink} />
            {/* Snout */}
            <ellipse cx="16" cy="20" rx="3" ry="2" fill={palette.border} opacity="0.5" />
            <circle cx="16" cy="19.5" r="1" fill={palette.ink} />
            <path
              d="M15.2 21c.5.5 1.1.5 1.6 0"
              stroke={palette.ink}
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Blush */}
            <circle cx="11" cy="19" r="1.4" fill={palette.blush} opacity="0.8" />
            <circle cx="21" cy="19" r="1.4" fill={palette.blush} opacity="0.8" />
          </g>
        )}

        {motifIndex === 5 && (
          // 6. Sweet Mochi Bun
          <g>
            {/* Little Leaf/Topper */}
            <path
              d="M16 11c0-3 3-4 4-4s0 3-4 4Z"
              fill={palette.accent}
              stroke={palette.ink}
              strokeWidth="1.3"
            />
            {/* Mochi dome */}
            <path
              d="M7 23c0-6 4-10 9-10s9 4 9 10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Wink and Eye */}
            <path
              d="M11.5 18c.6-.8 1.6-.8 2.2 0"
              stroke={palette.ink}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <circle cx="19" cy="17.5" r="1.3" fill={palette.ink} />
            {/* Blush */}
            <circle cx="10" cy="20" r="1.6" fill={palette.blush} opacity="0.85" />
            <circle cx="21" cy="20" r="1.6" fill={palette.blush} opacity="0.85" />
            {/* Little mouth */}
            <circle cx="15.5" cy="19.5" r="0.9" fill={palette.ink} />
          </g>
        )}

        {motifIndex === 6 && (
          // 7. Starry Pookie / Sparkle Buddy
          <g>
            <path
              d="M16 6l2.5 6 6 1.5-4.5 4.5 1.2 6.5-5.2-3.2-5.2 3.2 1.2-6.5L7.5 13.5l6-1.5L16 6Z"
              fill={palette.bg}
              stroke={palette.ink}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Eyes */}
            <circle cx="13.5" cy="15.5" r="1.2" fill={palette.ink} />
            <circle cx="18.5" cy="15.5" r="1.2" fill={palette.ink} />
            {/* Blush */}
            <circle cx="12" cy="17.2" r="1.3" fill={palette.blush} opacity="0.8" />
            <circle cx="20" cy="17.2" r="1.3" fill={palette.blush} opacity="0.8" />
            {/* Smile */}
            <path
              d="M15 17.5c.6.6 1.4.6 2 0"
              stroke={palette.ink}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* Tiny decorative star spark */}
      {showSparkle && (
        <span
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ backgroundColor: palette.accent }}
        />
      )}
    </div>
  );
}
