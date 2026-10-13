import {
  Sprout,
  Cpu,
  GraduationCap,
  Code2,
  Lightbulb,
  Shuffle,
  Ghost,
  MoonStar,
  HeartHandshake,
  Palette,
  Sparkles,
} from "lucide-react";
export function TopicIcon({ name, className = "" }: { name: string; className?: string }) {
  const Icon =
    (
      {
        Life: Sprout,
        Technology: Cpu,
        University: GraduationCap,
        Programming: Code2,
        Ideas: Lightbulb,
        Random: Shuffle,
        "Late Night Thoughts": MoonStar,
        Confessions: HeartHandshake,
        Creativity: Palette,
        "Daily Question": Sparkles,
      } as Record<string, typeof Sprout>
    )[name] ?? Ghost;
  return <Icon className={className} />;
}
export function UnsaidMark({ className = "" }: { className?: string }) {
  return (
    <span className={`unsaid-mark ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        {/* Soft rounded speech / thought bubble */}
        <path
          d="M7 16C7 10.4772 11.4772 6 17 6C22.5228 6 27 10.4772 27 16C27 21.5228 22.5228 26 17 26C14.8682 26 12.8797 25.3344 11.2374 24.1953L6.5 25.5L7.8047 20.7626C7.2831 19.3082 7 17.7126 7 16Z"
          fill="currentColor"
          fillOpacity=".15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Whispered thought dots */}
        <circle cx="13" cy="16" r="1.5" fill="currentColor" />
        <circle cx="17" cy="16" r="1.5" fill="currentColor" />
        <circle cx="21" cy="16" r="1.5" fill="currentColor" />
        {/* Expression star spark */}
        <path
          d="M26 8.5C26 8.5 27 6.5 27.5 6.5C28 6.5 29 8.5 29 8.5C29 8.5 31 9 31 9.5C31 10 29 10.5 29 10.5C29 10.5 28 12.5 27.5 12.5C27 12.5 26 10.5 26 10.5C26 10.5 24 10 24 9.5C24 9 26 8.5 26 8.5Z"
          fill="var(--primary)"
        />
      </svg>
    </span>
  );
}

export const GhostMark = UnsaidMark;
