import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post, PrivacyAlert, Reaction, ReactionKind, Reply } from "@/types/ghostline";
import { seedPosts } from "@/lib/services/mock";

const POSTS_COLL = "posts";
const ALERTS_COLL = "alerts";

/**
 * Normalizes a post from Firestore into the representation for the local user/device.
 * It computes the correct reaction count and whether THIS user/device has selected the reaction,
 * so each device independently tracks its own love / dislike status while seeing real-time
 * counts from all other devices.
 */
export function normalizePostForUser(rawPost: Post, currentUserId: string): Post {
  const rawReactions = Array.isArray(rawPost.reactions) ? rawPost.reactions : [];
  const kinds: ReactionKind[] = ["love", "dislike"];

  const reactions: Reaction[] = kinds.map((kind) => {
    const existing = rawReactions.find(
      (r) => r.kind === kind || (kind === "love" && r.kind === "heart"),
    );
    const users: string[] = Array.isArray(existing?.users) ? existing!.users : [];
    const hasMyReaction = Boolean(currentUserId && users.includes(currentUserId));

    // If baseCount is set, use it; otherwise fallback to existing count if no users array yet
    const baseCount =
      typeof existing?.baseCount === "number"
        ? existing.baseCount
        : users.length === 0
          ? existing?.count || 0
          : 0;

    const count = users.length > 0 ? baseCount + users.length : (existing?.count ?? baseCount);

    return {
      kind,
      count: Math.max(0, count),
      users,
      baseCount,
      selected: hasMyReaction,
    };
  });

  const rawReplies = Array.isArray(rawPost.replies) ? rawPost.replies : [];
  const replies: Reply[] = rawReplies.map((rep) => {
    const likedUsers: string[] = Array.isArray(rep.likedUsers) ? rep.likedUsers : [];
    const isLikedByMe = Boolean(currentUserId && likedUsers.includes(currentUserId));
    const baseLikes =
      typeof rep.baseLikes === "number"
        ? rep.baseLikes
        : likedUsers.length === 0
          ? rep.likes || 0
          : 0;
    const likes = likedUsers.length > 0 ? baseLikes + likedUsers.length : (rep.likes ?? baseLikes);

    return {
      ...rep,
      likes: Math.max(0, likes),
      likedUsers,
      baseLikes,
      liked: isLikedByMe,
    };
  });

  return {
    ...rawPost,
    reactions,
    replies,
  };
}

/**
 * Subscribe in real-time to posts from Firestore.
 * Ephemeral 24h filter and automatic moderation filtering applied.
 * Works across all browsers, users, and survives page refreshes on Vercel.
 */
export function subscribeToPosts(
  onData: (posts: Post[]) => void,
  onError?: (error: Error) => void,
  getCurrentUserId?: () => string,
) {
  const postsRef = collection(db, POSTS_COLL);
  const q = query(postsRef, orderBy("createdAt", "desc"), limit(100));

  let initialized = false;

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const currentUserId = getCurrentUserId ? getCurrentUserId() : "";

      // If collection is empty on first load, seed with initial welcome post
      if (snapshot.empty) {
        if (!initialized) {
          initialized = true;
          try {
            const seeds = seedPosts(Date.now());
            for (const s of seeds) {
              await setDoc(doc(db, POSTS_COLL, s.id), s);
            }
          } catch (err) {
            console.warn("Seeding initial post error:", err);
          }
        }
        onData(seedPosts(Date.now()).map((p) => normalizePostForUser(p, currentUserId)));
        return;
      }

      initialized = true;
      const now = Date.now();
      const results: Post[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as Post;
        const reportCount = data.reportCount || 0;

        // PRIVACY ENFORCEMENT:
        // If any post reached 4 or more reports, delete/retire it and alert creator
        if (reportCount >= 4 && !data.deleted) {
          triggerAutoPrivacyDeletion(data).catch(() => {});
          continue;
        }

        // Filter out expired (24h) or deleted posts
        if (data.deleted === true || data.expiresAt <= now) {
          continue;
        }

        results.push(normalizePostForUser(data, currentUserId));
      }

      // If all posts in Firestore are expired or deleted, show welcome seed post
      if (results.length === 0) {
        onData(seedPosts(Date.now()).map((p) => normalizePostForUser(p, currentUserId)));
      } else {
        onData(results);
      }
    },
    (err) => {
      console.warn("Firestore posts listener error:", err.message);
      if (onError) onError(err);
    },
  );

  return unsubscribe;
}

/**
 * Persist a newly created post to Firestore so it is permanently shared
 * and survives page refreshes and multi-user sessions.
 */
export async function createFirestorePost(post: Post): Promise<void> {
  const postRef = doc(db, POSTS_COLL, post.id);
  const finalPost: Post = {
    ...post,
    creatorId: post.creatorId || "anon-" + Date.now(),
    reportCount: post.reportCount || 0,
    reports: post.reports || [],
    deleted: false,
  };
  await setDoc(postRef, finalPost);
}

/**
 * Atomically toggle a reaction (love or dislike) on a post in Firestore.
 * Ensures cross-device consistency and prevents one user from overwriting another's reaction.
 */
export async function toggleFirestoreReaction(
  postId: string,
  userId: string,
  kind: ReactionKind,
): Promise<{ success: boolean; reactions?: Reaction[] }> {
  if (!postId || !userId) return { success: false };

  const postRef = doc(db, POSTS_COLL, postId);

  try {
    const updatedReactions = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(postRef);
      if (!snap.exists()) {
        throw new Error(`Post ${postId} not found`);
      }
      const data = snap.data() as Post;
      const existingReactions = Array.isArray(data.reactions) ? data.reactions : [];

      const reactionKinds: ReactionKind[] = ["love", "dislike"];
      const baseReactions = reactionKinds.map((k) => {
        const found = existingReactions.find(
          (r) => r.kind === k || (k === "love" && r.kind === "heart"),
        );
        if (found) {
          const users = Array.isArray(found.users) ? [...found.users] : [];
          const baseCount =
            typeof found.baseCount === "number"
              ? found.baseCount
              : users.length === 0
                ? found.count || 0
                : 0;
          return {
            kind: k,
            users,
            baseCount,
            count: users.length > 0 ? baseCount + users.length : found.count || baseCount,
          };
        }
        return { kind: k, users: [], baseCount: 0, count: 0 };
      });

      const target = baseReactions.find((r) => r.kind === kind);
      const isAlreadyReacted = target ? target.users.includes(userId) : false;

      const newReactions: Reaction[] = baseReactions.map((r) => {
        let users = [...r.users];
        if (r.kind === kind) {
          if (isAlreadyReacted) {
            // User unselected this reaction
            users = users.filter((u) => u !== userId);
          } else {
            // User selected this reaction
            if (!users.includes(userId)) {
              users.push(userId);
            }
          }
        } else {
          // Love and dislike are mutually exclusive on Unsaid
          users = users.filter((u) => u !== userId);
        }

        const count = Math.max(0, (r.baseCount || 0) + users.length);
        return {
          kind: r.kind,
          count,
          users,
          baseCount: r.baseCount || 0,
        };
      });

      transaction.update(postRef, { reactions: newReactions });
      return newReactions;
    });

    return { success: true, reactions: updatedReactions };
  } catch (err) {
    console.warn("Transactional reaction update failed, attempting direct update:", err);
    try {
      const snap = await getDoc(postRef);
      if (snap.exists()) {
        const data = snap.data() as Post;
        const currentReactions = Array.isArray(data.reactions) ? data.reactions : [];
        const nextReactions: Reaction[] = ["love" as const, "dislike" as const].map((k) => {
          const found = currentReactions.find(
            (r) => r.kind === k || (k === "love" && r.kind === "heart"),
          );
          let users = Array.isArray(found?.users) ? [...found!.users] : [];
          const baseCount =
            typeof found?.baseCount === "number"
              ? found.baseCount
              : users.length === 0
                ? found?.count || 0
                : 0;
          if (k === kind) {
            if (users.includes(userId)) {
              users = users.filter((u) => u !== userId);
            } else {
              users.push(userId);
            }
          } else {
            users = users.filter((u) => u !== userId);
          }
          return {
            kind: k,
            users,
            baseCount,
            count: Math.max(0, baseCount + users.length),
          };
        });
        await updateDoc(postRef, { reactions: nextReactions });
        return { success: true, reactions: nextReactions };
      }
    } catch (fallbackErr) {
      console.error("Direct reaction update also failed:", fallbackErr);
    }
    return { success: false };
  }
}

/**
 * Atomically toggle a like on a reply in Firestore across all devices.
 */
export async function toggleFirestoreReplyLike(
  postId: string,
  replyId: string,
  userId: string,
): Promise<{ success: boolean; replies?: Reply[] }> {
  if (!postId || !replyId || !userId) return { success: false };

  const postRef = doc(db, POSTS_COLL, postId);

  try {
    const updatedReplies = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(postRef);
      if (!snap.exists()) throw new Error(`Post ${postId} not found`);
      const post = snap.data() as Post;
      const replies = Array.isArray(post.replies) ? post.replies : [];

      const nextReplies: Reply[] = replies.map((rep) => {
        if (rep.id !== replyId) return rep;
        let likedUsers = Array.isArray(rep.likedUsers) ? [...rep.likedUsers] : [];
        const baseLikes =
          typeof rep.baseLikes === "number"
            ? rep.baseLikes
            : likedUsers.length === 0
              ? rep.likes || 0
              : 0;

        if (likedUsers.includes(userId)) {
          likedUsers = likedUsers.filter((u) => u !== userId);
        } else {
          likedUsers.push(userId);
        }
        const likes = Math.max(0, baseLikes + likedUsers.length);
        return {
          ...rep,
          likedUsers,
          baseLikes,
          likes,
        };
      });

      transaction.update(postRef, { replies: nextReplies });
      return nextReplies;
    });

    return { success: true, replies: updatedReplies };
  } catch (err) {
    console.warn("Transactional reply like failed, attempting direct update:", err);
    try {
      const snap = await getDoc(postRef);
      if (snap.exists()) {
        const post = snap.data() as Post;
        const replies = Array.isArray(post.replies) ? post.replies : [];
        const nextReplies = replies.map((rep) => {
          if (rep.id !== replyId) return rep;
          let likedUsers = Array.isArray(rep.likedUsers) ? [...rep.likedUsers] : [];
          const baseLikes =
            typeof rep.baseLikes === "number"
              ? rep.baseLikes
              : likedUsers.length === 0
                ? rep.likes || 0
                : 0;
          if (likedUsers.includes(userId)) {
            likedUsers = likedUsers.filter((u) => u !== userId);
          } else {
            likedUsers.push(userId);
          }
          return {
            ...rep,
            likedUsers,
            baseLikes,
            likes: Math.max(0, baseLikes + likedUsers.length),
          };
        });
        await updateDoc(postRef, { replies: nextReplies });
        return { success: true, replies: nextReplies };
      }
    } catch (fallbackErr) {
      console.error("Direct reply like fallback failed:", fallbackErr);
    }
    return { success: false };
  }
}

/**
 * Update reactions on a post in Firestore (fallback helper)
 */
export async function updateFirestoreReactions(
  postId: string,
  reactions: Reaction[],
): Promise<void> {
  const postRef = doc(db, POSTS_COLL, postId);
  await updateDoc(postRef, { reactions });
}

/**
 * Add a reply to a post in Firestore
 */
export async function addFirestoreReply(postId: string, newReply: Reply): Promise<void> {
  const postRef = doc(db, POSTS_COLL, postId);
  const snap = await getDoc(postRef);
  if (snap.exists()) {
    const post = snap.data() as Post;
    const currentReplies = post.replies || [];
    await updateDoc(postRef, {
      replies: [...currentReplies, newReply],
    });
  }
}

/**
 * Update replies array (for liking a reply, or deleting a reply)
 */
export async function updateFirestoreReplies(
  postId: string,
  updatedReplies: Reply[],
): Promise<void> {
  const postRef = doc(db, POSTS_COLL, postId);
  await updateDoc(postRef, { replies: updatedReplies });
}

/**
 * Edit post content in Firestore
 */
export async function editFirestorePost(
  postId: string,
  body: string,
  topic?: string,
): Promise<void> {
  const postRef = doc(db, POSTS_COLL, postId);
  await updateDoc(postRef, {
    body,
    ...(topic ? { topic } : {}),
    isEdited: true,
  });
}

/**
 * Delete post from Firestore
 */
export async function deleteFirestorePost(postId: string): Promise<void> {
  const postRef = doc(db, POSTS_COLL, postId);
  try {
    await deleteDoc(postRef);
  } catch {
    await updateDoc(postRef, { deleted: true });
  }
}

/**
 * Report a post for privacy or guideline violations.
 * If 4 or more reports are accumulated, the post is automatically deleted
 * and a privacy alert is recorded for the post creator.
 */
export async function reportFirestorePost(
  postId: string,
  reporterIdentifier: string,
  reason: string,
  currentPost?: Post,
): Promise<{ deleted: boolean; alreadyReported: boolean; reportCount: number }> {
  const postRef = doc(db, POSTS_COLL, postId);

  let targetPost = currentPost;
  if (!targetPost) {
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      targetPost = snap.data() as Post;
    }
  }

  if (!targetPost) {
    return { deleted: false, alreadyReported: false, reportCount: 0 };
  }

  const existingReports: string[] = targetPost.reports || [];
  if (existingReports.includes(reporterIdentifier)) {
    return {
      deleted: false,
      alreadyReported: true,
      reportCount: targetPost.reportCount || existingReports.length,
    };
  }

  const updatedReports = [...existingReports, reporterIdentifier];
  const newCount = (targetPost.reportCount || 0) + 1;

  if (newCount >= 4) {
    // 4 or more reports reached! Delete post and send privacy alert to creator
    await triggerAutoPrivacyDeletion(
      {
        ...targetPost,
        reportCount: newCount,
        reports: updatedReports,
      },
      reason,
    );
    return { deleted: true, alreadyReported: false, reportCount: newCount };
  } else {
    // Update report count and reports list
    await updateDoc(postRef, {
      reportCount: newCount,
      reports: updatedReports,
    });
    return { deleted: false, alreadyReported: false, reportCount: newCount };
  }
}

/**
 * Deletes post that reached 4 reports and delivers alert to creator
 */
async function triggerAutoPrivacyDeletion(post: Post, customReason?: string) {
  const postRef = doc(db, POSTS_COLL, post.id);

  // 1. Mark as deleted or delete document so it immediately disappears from feeds
  try {
    await updateDoc(postRef, {
      deleted: true,
      reportCount: Math.max(4, post.reportCount || 4),
    });
  } catch {
    try {
      await deleteDoc(postRef);
    } catch {
      // Ignore
    }
  }

  // 2. Deliver privacy alert to the post creator
  const recipient = post.creatorId || post.alias;
  if (recipient) {
    try {
      const alertId = `alert-${crypto.randomUUID()}`;
      const alertDoc: PrivacyAlert = {
        id: alertId,
        creatorId: recipient,
        postId: post.id,
        postSnippet: post.body.length > 50 ? `${post.body.slice(0, 50)}...` : post.body,
        reason: customReason || "Received 4 community privacy reports",
        createdAt: Date.now(),
        read: false,
      };
      await setDoc(doc(db, ALERTS_COLL, alertId), alertDoc);
    } catch (err) {
      console.warn("Could not save creator alert to Firestore:", err);
    }
  }
}

/**
 * Subscribe to privacy and moderation alerts for the current creator
 */
export function subscribeToPrivacyAlerts(
  creatorIdentifier: string,
  onAlerts: (alerts: PrivacyAlert[]) => void,
) {
  const alertsRef = collection(db, ALERTS_COLL);
  const q = query(alertsRef, orderBy("createdAt", "desc"), limit(20));

  return onSnapshot(
    q,
    (snapshot) => {
      const allAlerts: PrivacyAlert[] = [];
      for (const d of snapshot.docs) {
        const item = d.data() as PrivacyAlert;
        if (item.creatorId === creatorIdentifier) {
          allAlerts.push(item);
        }
      }
      onAlerts(allAlerts);
    },
    (err) => {
      console.warn("Alerts listener error:", err.message);
    },
  );
}

/**
 * Mark a privacy alert as read
 */
export async function markAlertRead(alertId: string): Promise<void> {
  try {
    const alertRef = doc(db, ALERTS_COLL, alertId);
    await updateDoc(alertRef, { read: true });
  } catch {
    // Ignore error
  }
}
