import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Post, ReactionKind } from "@/types/ghostline";
import { makePost, seedPosts, isActive, validBody } from "@/lib/services/mock";
import { getStoredOrNewAlias, generateCutePseudonym, isValidAlias } from "@/lib/pseudonym";
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
  deleteReply: (postId: string, replyId: string) => boolean;
}

const Context = createContext<Store | null>(null);

export function GhostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [now, setNow] = useState(0);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [alias, setAliasState] = useState<string>("PookieBear");
  const [topic, setTopic] = useState("All topics");
  const [blocked, setBlocked] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>(["Life", "Ideas"]);
  const [compose, setCompose] = useState(false);
  const [onboard, setOnboard] = useState(false);

  useEffect(() => {
    const time = Date.now();
    setNow(time);
    // Initialize rich seed thoughts so feed and conversations are immediately lively
    setPosts(seedPosts(time));
    setReady(true);

    const storedAlias = getStoredOrNewAlias();
    setAliasState(storedAlias);

    setOnboard(localStorage.getItem("ghostline-onboarded") !== "yes");
    const savedTheme = localStorage.getItem("ghostline-theme");
    if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
      setTheme(savedTheme);
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && mq.matches),
      );
    apply();
    mq.addEventListener("change", apply);
    if (ready) localStorage.setItem("ghostline-theme", theme);
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
    localStorage.setItem("ghostline-onboarded", "yes");
    setOnboard(false);
  };

  const publish = (body: string, t: string) => {
    if (!validBody(body)) return false;
    const time = Date.now();
    setNow(time);
    setPosts((p) => [makePost(body, t, time, alias), ...p]);
    toast.success("Thought posted! Fades automatically in 24h.");
    return true;
  };

  const react = (id: string, kind: ReactionKind) => {
    const time = Date.now();
    setNow(time);
    setPosts((p) =>
      p.map((x) => {
        if (x.id !== id || !isActive(x, time)) return x;
        const currentTarget = x.reactions.find((r) => r.kind === kind);
        const willSelect = !currentTarget?.selected;
        return {
          ...x,
          reactions: x.reactions.map((r) => {
            if (r.kind === kind) {
              return {
                ...r,
                count: willSelect ? r.count + 1 : Math.max(0, r.count - 1),
                selected: willSelect,
              };
            }
            // If selecting one reaction, deselect competing ones
            if (willSelect && r.selected) {
              return {
                ...r,
                count: Math.max(0, r.count - 1),
                selected: false,
              };
            }
            return r;
          }),
        };
      }),
    );
  };

  const reply = (id: string, body: string) => {
    const time = Date.now();
    const parent = posts.find((p) => p.id === id);
    if (!validBody(body) || !parent || !isActive(parent, time)) return false;
    setNow(time);
    setPosts((p) =>
      p.map((x) =>
        x.id === id
          ? {
              ...x,
              replies: [
                ...x.replies,
                {
                  id: crypto.randomUUID(),
                  alias,
                  body: body.trim(),
                  createdAt: time,
                  likes: 0,
                  liked: false,
                },
              ],
            }
          : x,
      ),
    );
    toast.success("Reply added · Fades with this thought");
    return true;
  };

  const reactReply = (postId: string, replyId: string) => {
    const time = Date.now();
    setNow(time);
    setPosts((p) =>
      p.map((post) => {
        if (post.id !== postId || !isActive(post, time)) return post;
        return {
          ...post,
          replies: post.replies.map((r) => {
            if (r.id !== replyId) return r;
            const willLike = !r.liked;
            return {
              ...r,
              liked: willLike,
              likes: willLike ? (r.likes || 0) + 1 : Math.max(0, (r.likes || 0) - 1),
            };
          }),
        };
      }),
    );
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
    setPosts((p) => p.filter((x) => x.alias !== alias));
    const fresh = generateCutePseudonym();
    setAlias(fresh);
    setBlocked([]);
    setJoined([]);
    toast.success("Identity reset with a new pseudonym");
  };

  const deletePost = (id: string) => {
    const target = posts.find((p) => p.id === id);
    if (!target) return false;
    if (target.alias !== alias) {
      toast.error("You can only delete your own thoughts");
      return false;
    }
    setPosts((p) => p.filter((x) => x.id !== id));
    toast.success("Thought deleted");
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
    setPosts((p) =>
      p.map((x) =>
        x.id === postId ? { ...x, replies: x.replies.filter((r) => r.id !== replyId) } : x,
      ),
    );
    toast.success("Reply deleted");
    return true;
  };

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
        deleteReply,
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
