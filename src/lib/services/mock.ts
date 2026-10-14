import type { Post, Topic } from "@/types/ghostline";
export const PRIVACY_NOTICE =
  "Posts disappear from Unsaid after 24 hours. Screenshots, external copies, and certain backup or legally required records may persist.";
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
export function makePost(
  body: string,
  topic: string,
  now: number,
  alias = "PookieBear",
  creatorId = "",
): Post {
  return {
    id: crypto.randomUUID(),
    alias,
    creatorId,
    body: body.trim(),
    topic,
    createdAt: now,
    expiresAt: now + 86400000,
    reactions: [
      { kind: "love", count: 0, selected: false, users: [], baseCount: 0 },
      { kind: "dislike", count: 0, selected: false, users: [], baseCount: 0 },
    ],
    replies: [],
    tone: "lavender",
    reportCount: 0,
    reports: [],
    deleted: false,
  };
}
export function seedPosts(now: number): Post[] {
  const rows = [
    [
      "Unsaid",
      "Welcome to Unsaid! 🌸 This is a quiet, cozy space for sharing thoughts, late-night reflections, and genuine conversations without permanent digital footprints.\n\nSome things are easier to say anonymously. Every thought gently fades away after 24 hours.",
      "Ideas",
      15,
      18,
      2,
      "lavender",
    ],
  ];
  return rows.map((r, i) => ({
    id: `post-${i + 1}`,
    alias: String(r[0]),
    creatorId: "unsaid-system",
    body: String(r[1]),
    topic: String(r[2]),
    createdAt: now - Number(r[3]) * 60000,
    expiresAt: now + (1440 - Number(r[3])) * 60000,
    reactions: [
      {
        kind: "love" as const,
        count: Number(r[4]),
        selected: false,
        users: [],
        baseCount: Number(r[4]),
      },
      {
        kind: "dislike" as const,
        count: Math.max(0, Math.floor(Number(r[4]) / 5)),
        selected: false,
        users: [],
        baseCount: Math.max(0, Math.floor(Number(r[4]) / 5)),
      },
    ],
    replies: [
      {
        id: `reply-${i}-0`,
        alias: "CozyGuide",
        body: "So happy you're here! Feel free to share a thought of your own, reply, or just wander through.",
        createdAt: now - (Number(r[3]) - 2) * 60000,
        likes: 4,
        liked: false,
        likedUsers: [],
        baseLikes: 4,
      },
      {
        id: `reply-${i}-1`,
        alias: "StarryPookie",
        body: "Love that everything is ephemeral here. Truly a breath of fresh air.",
        createdAt: now - (Number(r[3]) - 5) * 60000,
        likes: 2,
        liked: false,
        likedUsers: [],
        baseLikes: 2,
      },
    ],
    tone: String(r[6]),
    reportCount: 0,
    reports: [],
    deleted: false,
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

export function remainingDetailed(expires: number, now: number) {
  const diff = Math.max(0, expires - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

export function isExpiringSoon(expires: number, now: number) {
  return expires - now < 7200000; // less than 2 hours remaining
}
