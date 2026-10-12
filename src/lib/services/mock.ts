import type { Post, Topic } from "@/types/ghostline";
export const PRIVACY_NOTICE =
  "Posts disappear from Ghostline after 24 hours. Screenshots, external copies, and certain backup or legally required records may persist.";
export const topics: Topic[] = [
  {
    name: "Life",
    description: "The little things. The big feelings. Everything in between.",
    tone: "green",
    icon: "Sprout",
  },
  {
    name: "Technology",
    description: "What’s next, what’s useful, and what makes you think.",
    tone: "blue",
    icon: "Cpu",
  },
  {
    name: "University",
    description: "Campus life, late-night studying, and figuring it out.",
    tone: "lavender",
    icon: "GraduationCap",
  },
  {
    name: "Programming",
    description: "Side projects, small wins, and that one stubborn bug.",
    tone: "amber",
    icon: "Code2",
  },
  {
    name: "Ideas",
    description: "What if? A space for your not-quite-finished thoughts.",
    tone: "pink",
    icon: "Lightbulb",
  },
  {
    name: "Random",
    description: "No category needed. Just something on your mind.",
    tone: "blue",
    icon: "Shuffle",
  },
];
export function isActive(post: Post, now: number) {
  return post.expiresAt > now;
}
export function validBody(body: string) {
  return body.trim().length > 0 && body.length <= 280;
}
export function makePost(body: string, topic: string, now: number, alias = "QuietFox42"): Post {
  return {
    id: crypto.randomUUID(),
    alias,
    body: body.trim(),
    topic,
    createdAt: now,
    expiresAt: now + 86400000,
    reactions: [
      { kind: "heart", count: 0, selected: false },
      { kind: "relate", count: 0, selected: false },
    ],
    replies: [],
    tone: "lavender",
  };
}
export function seedPosts(now: number): Post[] {
  const rows = [
    [
      "GentleOrbit",
      "I went for a walk without my phone today. No music, no podcast, no destination. Just me and the world.\n\nI forgot how nice that feels.",
      "Life",
      18,
      42,
      8,
      "green",
    ],
    [
      "PixelWanderer",
      "Unpopular opinion: not every hobby needs to become a side hustle. Sometimes making something just because it makes you happy is enough.",
      "Ideas",
      46,
      68,
      14,
      "lavender",
    ],
    [
      "SleepyComet",
      "Finally fixed a bug I’ve been staring at for three days.\n\nIt was a missing comma. I’m going outside.",
      "Programming",
      72,
      35,
      6,
      "blue",
    ],
    [
      "PaperMoon",
      "Does anyone else feel like university is 10% learning and 90% learning how to be a person?",
      "University",
      115,
      24,
      9,
      "amber",
    ],
    [
      "SoftEcho",
      "Somewhere in the world, someone is having the best day of their life. I like thinking about that.",
      "Life",
      185,
      91,
      12,
      "pink",
    ],
    [
      "CuriousCloud",
      "What’s one piece of technology you wish didn’t exist? Mine is the “seen” receipt. Let me reply in peace.",
      "Technology",
      242,
      19,
      4,
      "blue",
    ],
  ];
  return rows.map((r, i) => ({
    id: `post-${i + 1}`,
    alias: String(r[0]),
    body: String(r[1]),
    topic: String(r[2]),
    createdAt: now - (i === 1 ? 1440 - 204 : Number(r[3])) * 60000,
    expiresAt: now + (i === 1 ? 204 : 1440 - Number(r[3])) * 60000,
    reactions: [
      { kind: "heart" as const, count: Number(r[4]), selected: false },
      { kind: "relate" as const, count: Math.floor(Number(r[4]) / 3), selected: false },
    ],
    replies: Array.from({ length: Number(r[5]) }, (_, j) => ({
      id: `reply-${i}-${j}`,
      alias: ["MellowFinch", "WanderingLeaf", "LittleNova"][j % 3] ?? "MellowFinch",
      body: [
        "Needed to read this today. Thank you for putting it into words.",
        "Honestly, same. There’s something really comforting about that.",
        "A little reminder to slow down. I’m taking this with me today.",
      ][j % 3] ?? "A thought worth sharing.",
      createdAt: now - (Number(r[3]) - j - 1) * 60000,
    })),
    tone: String(r[6]),
  }));
}
export function relativeTime(created: number, now: number) {
  const m = Math.max(0, Math.floor((now - created) / 60000));
  return m < 1 ? "Just now" : m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
}
export function remaining(expires: number, now: number) {
  const m = Math.max(0, Math.ceil((expires - now) / 60000));
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}
