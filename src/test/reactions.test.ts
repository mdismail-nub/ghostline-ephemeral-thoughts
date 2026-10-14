import { describe, it, expect } from "vitest";
import { makePost } from "@/lib/services/mock";
import { normalizePostForUser } from "@/lib/services/firestore-posts";
import type { Post } from "@/types/ghostline";

describe("Cross-device multi-user reaction mechanics", () => {
  it("allows Device A to like while Device B sees updated count without being selected", () => {
    const post: Post = makePost(
      "Testing cross-device likes",
      "Ideas",
      1000,
      "PeachyOtter",
      "creator-1",
    );

    const deviceA_id = "device-A-uuid";
    const deviceB_id = "device-B-uuid";

    // Initial state: neither has reacted
    const normA1 = normalizePostForUser(post, deviceA_id);
    const normB1 = normalizePostForUser(post, deviceB_id);

    expect(normA1.reactions[0].count).toBe(0);
    expect(normA1.reactions[0].selected).toBe(false);
    expect(normB1.reactions[0].count).toBe(0);
    expect(normB1.reactions[0].selected).toBe(false);

    // Device A likes the post
    const postAfterALiked: Post = {
      ...post,
      reactions: [
        {
          kind: "love",
          count: 1,
          users: [deviceA_id],
          baseCount: 0,
        },
        {
          kind: "dislike",
          count: 0,
          users: [],
          baseCount: 0,
        },
      ],
    };

    const normA2 = normalizePostForUser(postAfterALiked, deviceA_id);
    const normB2 = normalizePostForUser(postAfterALiked, deviceB_id);

    // Device A sees count: 1 and selected: true
    expect(normA2.reactions[0].count).toBe(1);
    expect(normA2.reactions[0].selected).toBe(true);

    // Device B sees count: 1 and selected: false
    expect(normB2.reactions[0].count).toBe(1);
    expect(normB2.reactions[0].selected).toBe(false);
  });

  it("aggregates likes from both Device A and Device B simultaneously", () => {
    const deviceA_id = "device-A-uuid";
    const deviceB_id = "device-B-uuid";

    const postAfterBothLiked: Post = {
      ...makePost("Both devices like this thought", "Life", 2000),
      reactions: [
        {
          kind: "love",
          count: 2,
          users: [deviceA_id, deviceB_id],
          baseCount: 0,
        },
        {
          kind: "dislike",
          count: 0,
          users: [],
          baseCount: 0,
        },
      ],
    };

    const normA = normalizePostForUser(postAfterBothLiked, deviceA_id);
    const normB = normalizePostForUser(postAfterBothLiked, deviceB_id);

    expect(normA.reactions[0].count).toBe(2);
    expect(normA.reactions[0].selected).toBe(true);

    expect(normB.reactions[0].count).toBe(2);
    expect(normB.reactions[0].selected).toBe(true);
  });

  it("handles unliking from Device A without affecting Device B", () => {
    const deviceA_id = "device-A-uuid";
    const deviceB_id = "device-B-uuid";

    // Device A unliked, so only Device B remains in users
    const postAfterAUnliked: Post = {
      ...makePost("A unliked", "Life", 3000),
      reactions: [
        {
          kind: "love",
          count: 1,
          users: [deviceB_id],
          baseCount: 0,
        },
        {
          kind: "dislike",
          count: 0,
          users: [],
          baseCount: 0,
        },
      ],
    };

    const normA = normalizePostForUser(postAfterAUnliked, deviceA_id);
    const normB = normalizePostForUser(postAfterAUnliked, deviceB_id);

    expect(normA.reactions[0].count).toBe(1);
    expect(normA.reactions[0].selected).toBe(false);

    expect(normB.reactions[0].count).toBe(1);
    expect(normB.reactions[0].selected).toBe(true);
  });

  it("preserves baseCount from historical or seeded posts", () => {
    const historicalPost: Post = {
      ...makePost("Historical post with 15 initial loves", "Technology", 4000),
      reactions: [
        {
          kind: "love",
          count: 15,
          users: ["device-C"],
          baseCount: 14,
        },
        {
          kind: "dislike",
          count: 2,
          users: [],
          baseCount: 2,
        },
      ],
    };

    const normVisitor = normalizePostForUser(historicalPost, "visitor-device");
    expect(normVisitor.reactions[0].count).toBe(15);
    expect(normVisitor.reactions[0].selected).toBe(false);

    const normDeviceC = normalizePostForUser(historicalPost, "device-C");
    expect(normDeviceC.reactions[0].count).toBe(15);
    expect(normDeviceC.reactions[0].selected).toBe(true);
  });
});
