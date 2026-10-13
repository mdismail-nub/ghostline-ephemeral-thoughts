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
export function GhostMark({ className = "" }: { className?: string }) {
  return (
    <span className={`ghost-mark ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M6 25V14a10 10 0 0 1 20 0v11l-4-2-3 3-3-2-4 3-2-3-4 1Z"
          fill="currentColor"
          fillOpacity=".16"
          stroke="currentColor"
          strokeLinejoin="round"
        />
        <ellipse cx="12" cy="14" rx="1.3" ry="1.8" fill="currentColor" />
        <ellipse cx="20" cy="14" rx="1.3" ry="1.8" fill="currentColor" />
        <path d="M14 19q2 2 4 0" stroke="currentColor" strokeLinecap="round" />
      </svg>
      <span className="ghost-spark" />
    </span>
  );
}
