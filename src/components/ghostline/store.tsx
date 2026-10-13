import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Post, ReactionKind } from "@/types/ghostline";
import { makePost, isActive, validBody } from "@/lib/services/mock";
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
  const [alias, setAlias] = useState("QuietFox42");
  const [topic, setTopic] = useState("All topics");
  const [blocked, setBlocked] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>(["Life", "Ideas"]);
  const [compose, setCompose] = useState(false);
  const [onboard, setOnboard] = useState(false);
  useEffect(() => {
    const time = Date.now();
    setNow(time);
    // Start with zero dummy data as requested
    setPosts([]);
    setReady(true);
    setOnboard(localStorage.getItem("ghostline-onboarded") !== "yes");
    const saved = localStorage.getItem("ghostline-theme");
    if (saved === "dark" || saved === "light" || saved === "system") setTheme(saved);
    const interval = setInterval(() => setNow(Date.now()), 10000);
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
  const finishOnboarding = () => {
    localStorage.setItem("ghostline-onboarded", "yes");
    setOnboard(false);
  };
  const publish = (body: string, t: string) => {
    if (!validBody(body)) return false;
    const time = Date.now();
    setNow(time);
    setPosts((p) => [makePost(body, t, time, alias), ...p]);
    toast.success("Thought posted! Disappears automatically in 24h.");
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
            // If selecting one reaction, unselect the other (e.g. love vs dislike)
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
                { id: crypto.randomUUID(), alias, body: body.trim(), createdAt: time },
              ],
            }
          : x,
      ),
    );
    toast.success("Reply added · Disappears with this thought");
    return true;
  };
  const block = (s: string) => {
    setBlocked((b) => (b.includes(s) ? b : [...b, s]));
    toast.success(`${s} blocked`);
  };
  const join = (s: string) => {
    setJoined((j) => (j.includes(s) ? j.filter((t) => t !== s) : [...j, s]));
    toast.success(joined.includes(s) ? `Left ${s}` : `Joined ${s}`);
  };
  const clearIdentity = () => {
    setPosts((p) => p.filter((x) => x.alias !== alias));
    setAlias("QuietFox42");
    setBlocked([]);
    setJoined([]);
    toast.success("Identity reset");
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
