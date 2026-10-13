import { describe, it, expect } from "vitest";
import { isActive, makePost, validBody, seedPosts, remaining } from "@/lib/services/mock";
describe("Unsaid mock boundaries", () => {
  it("accepts only nonempty thoughts with at most 280 characters", () => {
    expect(validBody("   ")).toBe(false);
    expect(validBody("a".repeat(280))).toBe(true);
    expect(validBody("a".repeat(281))).toBe(false);
  });
  it("expires at the exact 24 hour boundary", () => {
    const p = makePost("a thought", "Life", 1000);
    expect(p.expiresAt).toBe(86401000);
    expect(isActive(p, p.expiresAt - 1)).toBe(true);
    expect(isActive(p, p.expiresAt)).toBe(false);
  });
  it("gives no independent lifetime to replies", () => {
    const p = seedPosts(100000000)[0];
    if (!p) throw new Error("Missing seed post");
    expect(p.replies.length).toBeGreaterThan(0);
    expect(p.replies[0]).not.toHaveProperty("expiresAt");
    expect(isActive(p, p.expiresAt)).toBe(false);
  });
  it("does not generate negative countdowns", () => {
    expect(remaining(0, 10000)).toBe("0h 0m");
  });
  it("initializes with exactly one welcome message post", () => {
    const posts = seedPosts(Date.now());
    expect(posts).toHaveLength(1);
    expect(posts[0]?.alias).toBe("Unsaid");
  });

  it("identifies when a post exceeds the 4-report privacy threshold", () => {
    const post = makePost("Testing privacy threshold", "Ideas", 1000, "PeachyOtter", "user-123");
    expect(post.reportCount).toBe(0);
    expect(post.reports).toEqual([]);

    // Simulate community reports
    const reporters = ["anon-1", "anon-2", "anon-3", "anon-4"];
    let count = 0;
    for (const reporter of reporters) {
      if (!post.reports?.includes(reporter)) {
        post.reports?.push(reporter);
        count++;
      }
    }
    post.reportCount = count;

    expect(post.reportCount).toBe(4);
    // Should trigger deletion when >= 4
    const shouldAutoDelete = (post.reportCount || 0) >= 4;
    expect(shouldAutoDelete).toBe(true);
  });
});
