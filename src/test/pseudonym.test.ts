import { describe, it, expect } from "vitest";
import { generateCutePseudonym, isValidAlias } from "@/lib/pseudonym";

describe("Cute Pseudonym Generator", () => {
  it("generates cute, valid pseudonyms matching pattern criteria", () => {
    for (let i = 0; i < 20; i++) {
      const name = generateCutePseudonym();
      expect(isValidAlias(name)).toBe(true);
      expect(name.length).toBeGreaterThanOrEqual(3);
      expect(name.length).toBeLessThanOrEqual(24);
      // Starts with a letter
      expect(/^[a-zA-Z]/.test(name)).toBe(true);
    }
  });

  it("avoids collisions by taking existing aliases into account", () => {
    const existing = ["PookieBear", "MochiBun", "PeachyPuff"];
    const generated = generateCutePseudonym(existing);
    expect(existing.map((e) => e.toLowerCase())).not.toContain(generated.toLowerCase());
  });

  it("rejects invalid or disallowed words", () => {
    expect(isValidAlias("ab")).toBe(false); // too short
    expect(isValidAlias("a".repeat(25))).toBe(false); // too long
    expect(isValidAlias("123bad")).toBe(false); // starts with number
    expect(isValidAlias("admin_user")).toBe(false); // disallowed word
    expect(isValidAlias("SleepyBoba")).toBe(true);
  });
});
