export interface ThoughtSpark {
  category: "Cozy" | "Random" | "Deep" | "Fun" | "Question";
  text: string;
  emoji: string;
}

export const THOUGHT_SPARKS: ThoughtSpark[] = [
  {
    category: "Cozy",
    text: "What's an oddly specific thing that made you smile today?",
    emoji: "☕",
  },
  {
    category: "Random",
    text: "Unpopular opinion: the sound of rain on a window is better than any lofi playlist.",
    emoji: "🌧️",
  },
  {
    category: "Fun",
    text: "Admit a harmless secret you've never told anyone in real life.",
    emoji: "🤫",
  },
  {
    category: "Deep",
    text: "If you could whisper one gentle reminder to everyone on Earth right now, what would it be?",
    emoji: "🌱",
  },
  {
    category: "Question",
    text: "What song is living rent-free in your head right now?",
    emoji: "🎵",
  },
  {
    category: "Cozy",
    text: "Describe your current vibe in three words: sleepy, warm, and hopeful.",
    emoji: "🧸",
  },
  {
    category: "Random",
    text: "If today was an ice cream flavor, what weird flavor would it be?",
    emoji: "🍨",
  },
  {
    category: "Deep",
    text: "Somewhere out there, an old version of you would be so proud of who you are today.",
    emoji: "✨",
  },
  {
    category: "Fun",
    text: "What's a tiny everyday superpower you wish humans naturally had?",
    emoji: "🪄",
  },
  {
    category: "Question",
    text: "What is your ultimate comfort meal when everything feels a bit too loud?",
    emoji: "🍜",
  },
  {
    category: "Cozy",
    text: "A friendly reminder to unclench your jaw, drop your shoulders, and take a deep breath.",
    emoji: "☁️",
  },
  {
    category: "Random",
    text: "I wonder how many strangers remember a tiny compliment I gave them years ago.",
    emoji: "💭",
  },
  {
    category: "Fun",
    text: "Tell me a weird habit you have that you secretly hope other people have too.",
    emoji: "👀",
  },
  {
    category: "Deep",
    text: "Not every hobby needs to become a career. Doing something just because it brings peace is enough.",
    emoji: "🎨",
  },
  {
    category: "Question",
    text: "What is the best unexpected interaction you've ever had with a stranger?",
    emoji: "💫",
  },
  {
    category: "Cozy",
    text: "Fresh bedsheets and an early bedtime is peak luxury.",
    emoji: "🌙",
  },
];

export function getRandomThoughtSpark(): ThoughtSpark {
  const index = Math.floor(Math.random() * THOUGHT_SPARKS.length);
  return THOUGHT_SPARKS[index] ?? THOUGHT_SPARKS[0]!;
}
