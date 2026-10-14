import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Post, PrivacyAlert, ReactionKind } from "@/types/ghostline";
import { makePost, seedPosts, isActive, validBody } from "@/lib/services/mock";
import {
  getStoredOrNewAlias,
  getStoredOrNewCreatorId,
  generateCutePseudonym,
  isValidAlias,
} from "@/lib/pseudonym";
import {
  subscribeToPosts,
  createFirestorePost,
  updateFirestoreReactions,
  addFirestoreReply,
  updateFirestoreReplies,
  editFirestorePost,
  deleteFirestorePost,
  reportFirestorePost,
  subscribeToPrivacyAlerts,
  markAlertRead,
} from "@/lib/services/firestore-posts";
import { testConnection, ensureAnonymousAuth, auth } from "@/lib/firebase";
import { toast } from "sonner";

type Theme = "light" | "dark" | "system";

interface Store {
  posts: Post[];
  now: number;
  ready: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  alias: string;
  setAlias: (s: string) => void;
  rotateAlias: () => string;
  creatorId: string;
  topic: string;
  setTopic: (s: string) => void;
  blocked: string[];
  block: (s: string) => void;
  unblock: (s: string) => void;
  joined: string[];
  join: (s: string) => void;
  publish: (body: string, topic: string) => boolean;
  react: (id: string, kind: ReactionKind) => void;
  reply: (id: string, body: string) => boolean;
  reactReply: (postId: string, replyId: string) => void;
  compose: boolean;
  setCompose: (b: boolean) => void;
  onboard: boolean;
  setOnboard: (b: boolean) => void;
  finishOnboarding: () => void;
  clearIdentity: () => void;
  deletePost: (id: string) => boolean;
  editPost: (id: string, newBody: string, newTopic?: string) => boolean;
  deleteReply: (postId: string, replyId: string) => boolean;
  reportPost: (
    postId: string,
    reason: string,
  ) => Promise<{ deleted: boolean; alreadyReported: boolean }>;
  alerts: PrivacyAlert[];
  unreadAlertCount: number;
  dismissAlert: (id: string) => void;
  activeAlertModal: PrivacyAlert | null;
  setActiveAlertModal: (alert: PrivacyAlert | null) => void;
}

const Context = createContext<Store | null>(null);

export function GhostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [now, setNow] = useState(0);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [alias, setAliasState] = useState<string>("PookieBear");
  const [creatorId, setCreatorId] = useState<string>("");
  const [topic, setTopic] = useState("All topics");
  const [blocked, setBlocked] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>(["Life", "Ideas"]);
  const [compose, setCompose] = useState(false);
  const [onboard, setOnboard] = useState(false);
  const [alerts, setAlerts] = useState<PrivacyAlert[]>([]);
  const [activeAlertModal, setActiveAlertModal] = useState<PrivacyAlert | null>(null);
  const [notifiedAlertIds, setNotifiedAlertIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const time = Date.now();
    setNow(time);

    // Initial placeholder thoughts while Firestore connects
    setPosts(seedPosts(time));

    const storedAlias = getStoredOrNewAlias();
    setAliasState(storedAlias);

    const storedCreatorId = getStoredOrNewCreatorId();
    setCreatorId(storedCreatorId);

    setOnboard(
      localStorage.getItem("unsaid-onboarded") !== "yes" &&
        localStorage.getItem("ghostline-onboarded") !== "yes",
    );
    const savedTheme =
      localStorage.getItem("unsaid-theme") || localStorage.getItem("ghostline-theme");
    if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
      setTheme(savedTheme);
    }

    // Connect to Firebase anonymous auth and subscribe to real-time posts
    testConnection().catch(() => {});
    ensureAnonymousAuth()
      .then((user) => {
        if (user?.uid) {
          setCreatorId(user.uid);
        }
      })
      .catch((err) => {
        console.warn("Anonymous auth initial failure:", err);
      });

    // Real-time Firestore subscription: works across all users, browsers, and refreshes on Vercel
    const unsubPosts = subscribeToPosts(
      (remotePosts) => {
        setPosts(remotePosts);
        setReady(true);
      },
      (err) => {
        console.warn("Firestore listener error, keeping seed posts:", err);
        setReady(true);
      },
    );

    const interval = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      unsubPosts();
      clearInterval(interval);
    };
  }, []);

  // Listen to privacy alerts for the current post creator
  useEffect(() => {
    if (!creatorId) return;

    const unsubAlerts = subscribeToPrivacyAlerts(creatorId, (incomingAlerts) => {
      setAlerts(incomingAlerts);

      // Check for unread alerts to notify creator
      const unreadAlerts = incomingAlerts.filter((a) => !a.read);
      for (const alert of unreadAlerts) {
        if (!notifiedAlertIds.has(alert.id)) {
          setNotifiedAlertIds((prev) => new Set([...prev, alert.id]));
          setActiveAlertModal(alert);
          toast.error("Privacy Alert: Post Removed", {
            description: `Your thought "${alert.postSnippet}" was removed because it reached 4 community reports.`,
            duration: 8000,
          });
          break;
        }
      }
    });

    return () => unsubAlerts();
  }, [creatorId, notifiedAlertIds]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && mq.matches),
      );
    apply();
    mq.addEventListener("change", apply);
    if (ready) {
      localStorage.setItem("unsaid-theme", theme);
      localStorage.setItem("ghostline-theme", theme);
    }
    return () => mq.removeEventListener("change", apply);
  }, [theme, ready]);

  const setAlias = (newAlias: string) => {
    const trimmed = newAlias.trim();
    if (!isValidAlias(trimmed)) {
      toast.error("Invalid pseudonym format");
      return;
    }
    setAliasState(trimmed);
    try {
      localStorage.setItem("unsaid-alias", trimmed);
      localStorage.setItem("ghostline-alias", trimmed);
    } catch {
      // Ignore storage error
    }
  };

  const rotateAlias = () => {
    const currentAliases = posts.map((p) => p.alias);
    const fresh = generateCutePseudonym(currentAliases);
    setAlias(fresh);
    toast.success(`Pseudonym rotated to ${fresh}`);
    return fresh;
  };

  const finishOnboarding = () => {
    localStorage.setItem("unsaid-onboarded", "yes");
    localStorage.setItem("ghostline-onboarded", "yes");
    setOnboard(false);
  };

  const publish = (body: string, t: string) => {
    if (!validBody(body)) return false;
    const time = Date.now();
    setNow(time);
    const effectiveCreatorId = auth.currentUser?.uid || creatorId || getStoredOrNewCreatorId();
    const newPost = makePost(body, t, time, alias, effectiveCreatorId);

    // Optimistic local update
    setPosts((p) => [newPost, ...p.filter((x) => x.id !== newPost.id)]);

    // Save to shared Firestore so it persists across refreshes on Vercel and is visible to all users
    createFirestorePost(newPost).catch((err) => {
      console.warn("Firestore sync warning on publish:", err);
    });

    toast.success("Thought posted! Visible to everyone, fades in 24h.");
    return true;
  };

  const react = (id: string, kind: ReactionKind) => {
    const time = Date.now();
    setNow(time);

    let updatedPostReactions: Post["reactions"] | null = null;

    setPosts((p) =>
      p.map((x) => {
        if (x.id !== id || !isActive(x, time)) return x;
        const currentTarget = x.reactions.find((r) => r.kind === kind);
        const willSelect = !currentTarget?.selected;
        const updated = x.reactions.map((r) => {
          if (r.kind === kind) {
            return {
              ...r,
              count: willSelect ? r.count + 1 : Math.max(0, r.count - 1),
              selected: willSelect,
            };
          }
          if (willSelect && r.selected) {
            return {
              ...r,
              count: Math.max(0, r.count - 1),
              selected: false,
            };
          }
          return r;
        });
        updatedPostReactions = updated;
        return {
          ...x,
          reactions: updated,
        };
      }),
    );

    if (updatedPostReactions) {
      updateFirestoreReactions(id, updatedPostReactions).catch((err) => {
        console.warn("Firestore reaction sync warning:", err);
      });
    }
  };

  const reply = (id: string, body: string) => {
    const time = Date.now();
    const parent = posts.find((p) => p.id === id);
    if (!validBody(body) || !parent || !isActive(parent, time)) return false;
    setNow(time);

    const newReply = {
      id: crypto.randomUUID(),
      alias,
      body: body.trim(),
      createdAt: time,
      likes: 0,
      liked: false,
    };

    setPosts((p) =>
      p.map((x) =>
        x.id === id
          ? {
              ...x,
              replies: [...x.replies, newReply],
            }
          : x,
      ),
    );

    addFirestoreReply(id, newReply).catch((err) => {
      console.warn("Firestore reply sync warning:", err);
    });

    toast.success("Reply added · Fades with this thought");
    return true;
  };

  const reactReply = (postId: string, replyId: string) => {
    const time = Date.now();
    setNow(time);

    let updatedRepliesForPost: Post["replies"] | null = null;

    setPosts((p) =>
      p.map((post) => {
        if (post.id !== postId || !isActive(post, time)) return post;
        const nextReplies = post.replies.map((r) => {
          if (r.id !== replyId) return r;
          const willLike = !r.liked;
          return {
            ...r,
            liked: willLike,
            likes: willLike ? (r.likes || 0) + 1 : Math.max(0, (r.likes || 0) - 1),
          };
        });
        updatedRepliesForPost = nextReplies;
        return {
          ...post,
          replies: nextReplies,
        };
      }),
    );

    if (updatedRepliesForPost) {
      updateFirestoreReplies(postId, updatedRepliesForPost).catch((err) => {
        console.warn("Firestore reply like sync warning:", err);
      });
    }
  };

  const block = (s: string) => {
    setBlocked((b) => (b.includes(s) ? b : [...b, s]));
    toast.success(`${s} blocked for this session`);
  };

  const join = (s: string) => {
    setJoined((j) => (j.includes(s) ? j.filter((t) => t !== s) : [...j, s]));
    toast.success(joined.includes(s) ? `Left #${s.toLowerCase()}` : `Joined #${s.toLowerCase()}`);
  };

  const clearIdentity = () => {
    setPosts((p) => p.filter((x) => x.alias !== alias && x.creatorId !== creatorId));
    const fresh = generateCutePseudonym();
    setAlias(fresh);
    setBlocked([]);
    setJoined([]);
    toast.success("Identity reset with a new pseudonym");
  };

  const deletePost = (id: string) => {
    const target = posts.find((p) => p.id === id);
    if (!target) return false;
    const isOwner =
      target.alias === alias ||
      (target.creatorId &&
        (target.creatorId === creatorId || target.creatorId === auth.currentUser?.uid));

    if (!isOwner) {
      toast.error("You can only delete your own thoughts");
      return false;
    }

    setPosts((p) => p.filter((x) => x.id !== id));
    deleteFirestorePost(id).catch((err) => {
      console.warn("Firestore delete post warning:", err);
    });
    toast.success("Thought deleted");
    return true;
  };

  const editPost = (id: string, newBody: string, newTopic?: string) => {
    const target = posts.find((p) => p.id === id);
    if (!target) return false;
    const isOwner =
      target.alias === alias ||
      (target.creatorId &&
        (target.creatorId === creatorId || target.creatorId === auth.currentUser?.uid));

    if (!isOwner) {
      toast.error("You can only edit your own thoughts");
      return false;
    }
    if (!validBody(newBody)) {
      toast.error("Thought content must be between 1 and 280 characters");
      return false;
    }
    const time = Date.now();
    if (!isActive(target, time)) {
      toast.error("This thought has already expired and cannot be edited");
      return false;
    }

    setPosts((p) =>
      p.map((x) =>
        x.id === id
          ? {
              ...x,
              body: newBody.trim(),
              ...(newTopic ? { topic: newTopic } : {}),
              isEdited: true,
            }
          : x,
      ),
    );

    editFirestorePost(id, newBody.trim(), newTopic).catch((err) => {
      console.warn("Firestore edit post warning:", err);
    });
    toast.success("Thought updated");
    return true;
  };

  const deleteReply = (postId: string, replyId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return false;
    const targetReply = targetPost.replies.find((r) => r.id === replyId);
    if (!targetReply) return false;
    if (targetReply.alias !== alias) {
      toast.error("You can only delete your own replies");
      return false;
    }

    const nextReplies = targetPost.replies.filter((r) => r.id !== replyId);
    setPosts((p) => p.map((x) => (x.id === postId ? { ...x, replies: nextReplies } : x)));

    updateFirestoreReplies(postId, nextReplies).catch((err) => {
      console.warn("Firestore delete reply warning:", err);
    });
    toast.success("Reply deleted");
    return true;
  };

  const reportPost = async (postId: string, reason: string) => {
    const target = posts.find((p) => p.id === postId);
    const reporterId = auth.currentUser?.uid || creatorId;
    const result = await reportFirestorePost(postId, reporterId, reason, target);

    if (result.deleted) {
      // 4 or more reports reached! Remove from local feed immediately
      setPosts((p) => p.filter((x) => x.id !== postId));
      toast.error("Thought removed", {
        description: "This post received 4 community reports and was removed for privacy/safety.",
      });
    } else if (result.alreadyReported) {
      toast.info("Already reported", {
        description: "You have already submitted a report for this thought.",
      });
    } else {
      toast.success("Report submitted", {
        description: `Thank you. Report recorded (${result.reportCount}/4 before removal).`,
      });
    }

    return result;
  };

  const dismissAlert = (id: string) => {
    markAlertRead(id).catch(() => {});
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    if (activeAlertModal?.id === id) {
      setActiveAlertModal(null);
    }
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  return (
    <Context.Provider
      value={{
        posts: posts.filter((p) => isActive(p, now) && !blocked.includes(p.alias)),
        now,
        ready,
        theme,
        setTheme,
        alias,
        setAlias,
        rotateAlias,
        creatorId,
        topic,
        setTopic,
        blocked,
        block,
        unblock: (s) => setBlocked((b) => b.filter((x) => x !== s)),
        joined,
        join,
        publish,
        react,
        reply,
        reactReply,
        compose,
        setCompose,
        onboard,
        setOnboard,
        finishOnboarding,
        clearIdentity,
        deletePost,
        editPost,
        deleteReply,
        reportPost,
        alerts,
        unreadAlertCount,
        dismissAlert,
        activeAlertModal,
        setActiveAlertModal,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useGhost() {
  const value = useContext(Context);
  if (!value) throw new Error("GhostProvider missing");
  return value;
}
