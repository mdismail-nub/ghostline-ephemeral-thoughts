// Reusable cute pseudonym generator for Unsaid
// Combines adorable adjectives, animals, sweets, and whimsical concepts.

const CUTE_ADJECTIVES = [
  "Sleepy",
  "Cozy",
  "Dreamy",
  "Peachy",
  "Starry",
  "Moonie",
  "Lilac",
  "Fluffy",
  "Tiny",
  "Honey",
  "Berry",
  "Sweet",
  "Soft",
  "Rosy",
  "Sunny",
  "Milky",
  "Cloudie",
  "Bubbly",
  "Snuggly",
  "Pookie",
  "Mellow",
  "Warm",
  "Dainty",
  "Pixie",
  "Cotton",
  "Velvet",
  "Breezy",
  "Dewy",
  "Sparkly",
  "Pinky",
  "Gentle",
  "Little",
  "Jolly",
  "Lucky",
  "Clover",
  "Silky",
];

const CUTE_CREATURES = [
  "Bunny",
  "Bun",
  "Panda",
  "Bear",
  "Boba",
  "Ghost",
  "Finch",
  "Fox",
  "Kitty",
  "Koala",
  "Otter",
  "Fawn",
  "Pup",
  "Lamb",
  "Duckling",
  "Hamster",
  "Sprout",
  "Pixie",
  "Starling",
  "Bee",
  "Owl",
  "Bean",
  "Puff",
];

const CUTE_SWEETS_AND_FOODS = [
  "Mochi",
  "Boba",
  "Puff",
  "Marshmallow",
  "Berry",
  "Peach",
  "Waffle",
  "Pudding",
  "Matcha",
  "Cookie",
  "Biscuit",
  "Honey",
  "Cupcake",
  "Sugar",
  "Dumpling",
  "Truffle",
  "Jelly",
  "Plum",
  "Melon",
];

const CUTE_WHIMSICAL_OBJECTS = [
  "Cloud",
  "Cloudie",
  "Moon",
  "Star",
  "Spark",
  "Dew",
  "Breeze",
  "Blossom",
  "Petal",
  "Clover",
  "Meadow",
  "Whisper",
  "Orbit",
  "Glow",
  "Twinkle",
  "Comet",
  "Haven",
];

// Curated favorites from user prompt
const SIGNATURE_NAMES = [
  "PookieBear",
  "MochiBun",
  "PeachyPuff",
  "TinyCloud",
  "SleepyBoba",
  "BunnyBean",
  "CozyPanda",
  "LilacBun",
  "Marshmallow",
  "HoneyMochi",
  "StarryPookie",
  "MoonieBun",
  "BerryBoo",
  "Cloudie",
  "MochiGhost",
  "PinkyPuff",
  "BobaBean",
  "DreamyBun",
  "LilacGhost",
  "CottonCloud",
  "SweetOtter",
  "RosyBun",
  "MatchaPuff",
  "SunnySprout",
];

const DISALLOWED_WORDS = [
  "admin",
  "root",
  "moderator",
  "unsaid",
  "ghostline",
  "support",
  "system",
  "official",
  "hate",
  "nazi",
  "kill",
  "fuck",
  "shit",
  "bitch",
  "ass",
  "crap",
  "dick",
  "pussy",
  "slut",
  "whore",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function isValidAlias(alias: string): boolean {
  if (!alias || typeof alias !== "string") return false;
  const trimmed = alias.trim();
  if (trimmed.length < 3 || trimmed.length > 24) return false;
  if (!/^[a-zA-Z][a-zA-Z0-9_-]{2,23}$/.test(trimmed)) return false;

  const lower = trimmed.toLowerCase();
  for (const word of DISALLOWED_WORDS) {
    if (lower.includes(word)) return false;
  }
  return true;
}

/**
 * Generates a cute, memorable pseudonym adhering to Unsaid's cozy tone.
 * Patterns:
 * 1. Signature name list selection
 * 2. Adjective + Creature (e.g. SleepyBunny, CozyPanda)
 * 3. Sweet/Food + Whimsical Object/Creature (e.g. MochiCloud, BobaBean, HoneyMochi)
 * 4. Color/Vibe + Creature/Object (e.g. LilacWhisper, StarryCloud)
 */
export function generateCutePseudonym(existingAliases: string[] = []): string {
  const existingSet = new Set(existingAliases.map((a) => a.toLowerCase()));

  for (let attempt = 0; attempt < 50; attempt++) {
    let candidate = "";
    const roll = Math.random();

    if (roll < 0.25) {
      // Pick from signature names
      candidate = pick(SIGNATURE_NAMES);
    } else if (roll < 0.5) {
      // Adjective + Creature
      candidate = `${pick(CUTE_ADJECTIVES)}${pick(CUTE_CREATURES)}`;
    } else if (roll < 0.75) {
      // Food + Creature or Food + Object
      candidate = `${pick(CUTE_SWEETS_AND_FOODS)}${pick(
        Math.random() > 0.5 ? CUTE_CREATURES : CUTE_WHIMSICAL_OBJECTS,
      )}`;
    } else {
      // Adjective + Whimsical Object
      candidate = `${pick(CUTE_ADJECTIVES)}${pick(CUTE_WHIMSICAL_OBJECTS)}`;
    }

    if (!existingSet.has(candidate.toLowerCase()) && isValidAlias(candidate)) {
      return candidate;
    }
  }

  // If collision occurs, append a short unobtrusive 2-digit number
  const base = pick(SIGNATURE_NAMES);
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${base}${suffix}`;
}

export function getStoredOrNewAlias(existingAliases: string[] = []): string {
  if (typeof window === "undefined") {
    return generateCutePseudonym(existingAliases);
  }

  try {
    const saved = localStorage.getItem("unsaid-alias") || localStorage.getItem("ghostline-alias");
    if (saved && isValidAlias(saved)) {
      return saved;
    }
  } catch {
    // Ignore localStorage access issues
  }

  const fresh = generateCutePseudonym(existingAliases);
  try {
    localStorage.setItem("unsaid-alias", fresh);
    localStorage.setItem("ghostline-alias", fresh);
  } catch {
    // Ignore
  }
  return fresh;
}

export function getStoredOrNewCreatorId(): string {
  if (typeof window === "undefined") {
    return "anon-" + Math.random().toString(36).substring(2, 12);
  }

  try {
    const saved = localStorage.getItem("unsaid-creator-id");
    if (saved && saved.length > 5) {
      return saved;
    }
  } catch {
    // Ignore localStorage access issues
  }

  const fresh = "anon-" + crypto.randomUUID();
  try {
    localStorage.setItem("unsaid-creator-id", fresh);
  } catch {
    // Ignore
  }
  return fresh;
}
