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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Post, PrivacyAlert, Reaction, Reply } from "@/types/ghostline";
import { seedPosts } from "@/lib/services/mock";

const POSTS_COLL = "posts";
const ALERTS_COLL = "alerts";

/**
 * Subscribe in real-time to posts from Firestore.
 * Ephemeral 24h filter and automatic moderation filtering applied.
 * Works across all browsers, users, and survives page refreshes on Vercel.
 */
export function subscribeToPosts(
  onData: (posts: Post[]) => void,
  onError?: (error: Error) => void,
) {
  const postsRef = collection(db, POSTS_COLL);
  const q = query(postsRef, orderBy("createdAt", "desc"), limit(100));

  let initialized = false;

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
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
        onData(seedPosts(Date.now()));
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

        results.push(data);
      }

      // If all posts in Firestore are expired or deleted, show welcome seed post
      if (results.length === 0) {
        onData(seedPosts(Date.now()));
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
 * Update reactions on a post in Firestore
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
