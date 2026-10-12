import { topics } from "@/lib/services/mock";

// Presentation-only discovery categories; content lifetimes stay in the mock service.
export const discoveryTopics = [
  ...topics.filter((topic) => ["University", "Programming", "Life", "Random"].includes(topic.name)),
  { name: "Late Night Thoughts", description: "For the thoughts that arrive when the world gets quiet.", tone: "lavender" },
  { name: "Confessions", description: "A little honesty. A little weight off your shoulders.", tone: "pink" },
  { name: "Creativity", description: "Unfinished ideas, little projects, and happy accidents.", tone: "blue" },
  { name: "Daily Question", description: "One small question. A whole world of perspectives.", tone: "amber" },
  ...topics.filter((topic) => ["Technology", "Ideas"].includes(topic.name)),
];