import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Post } from "@/types/ghostline";
import { seedPosts, makePost, isActive, validBody } from "@/lib/services/mock";
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
  react: (id: string, kind: "heart" | "relate") => void;
  reply: (id: string, body: string) => boolean;
  compose: boolean;
  setCompose: (b: boolean) => void;
  onboard: boolean;
  setOnboard: (b: boolean) => void;
  finishOnboarding: () => void;
  clearIdentity: () => void;
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
    setPosts(seedPosts(time));
    setReady(true);
    setOnboard(localStorage.getItem("ghostline-onboarded") !== "yes");
    const saved = localStorage.getItem("ghostline-theme");
    if (saved === "dark" || saved === "light" || saved === "system") setTheme(saved);
    const interval = setInterval(() => setNow(Date.now()), 30000);
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
    toast.success("Post added to this preview");
    return true;
  };
  const react = (id: string, kind: "heart" | "relate") => {
    const time = Date.now();
    setNow(time);
    setPosts((p) =>
      p.map((x) =>
        x.id === id && isActive(x, time)
          ? {
              ...x,
              reactions: x.reactions.map((r) =>
                r.kind === kind
                  ? { ...r, count: r.count + (r.selected ? -1 : 1), selected: !r.selected }
                  : r,
              ),
            }
          : x,
      ),
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
    toast.success("Reply added to this preview");
    return true;
  };
  const block = (s: string) => {
    setBlocked((b) => (b.includes(s) ? b : [...b, s]));
    toast.success(`${s} blocked in this preview`);
  };
  const join = (s: string) => {
    setJoined((j) => (j.includes(s) ? j.filter((t) => t !== s) : [...j, s]));
    toast.success(joined.includes(s) ? `Left ${s}` : `Joined ${s} in this preview`);
  };
  const clearIdentity = () => {
    setPosts((p) => p.filter((x) => x.alias !== alias));
    setAlias("QuietFox42");
    setBlocked([]);
    setJoined([]);
    toast.success("Local identity reset; no real account was deleted");
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
