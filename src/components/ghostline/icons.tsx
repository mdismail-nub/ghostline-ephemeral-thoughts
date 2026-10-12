import { Sprout, Cpu, GraduationCap, Code2, Lightbulb, Shuffle, Ghost } from "lucide-react";
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
      } as Record<string, typeof Sprout>
    )[name] ?? Ghost;
  return <Icon className={className} />;
}
export function GhostMark({ className = "" }: { className?: string }) {
  return (
    <span className={`ghost-mark ${className}`}>
      <Ghost aria-hidden="true" />
      <span className="ghost-spark" />
    </span>
  );
}
