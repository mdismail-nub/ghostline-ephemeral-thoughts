import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Trash2,
  LogOut,
  ShieldCheck,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import { PageHeading, Rightbar, EmptyState } from "./layout";
import { GhostMark } from "./icons";
import { PostCard } from "./post-card";
import { PRIVACY_NOTICE } from "@/lib/services/mock";
export function SettingsPage() {
  const { theme, setTheme, alias, setAlias, blocked, unblock, clearIdentity, setOnboard } =
    useGhost();
  const [draft, setDraft] = useState(alias);
  const [confirm, setConfirm] = useState<"rotate" | "delete" | null>(null);
  const [error, setError] = useState("");
  function save() {
    if (!/^[a-zA-Z][a-zA-Z0-9]{2,23}$/.test(draft)) {
      setError("Use 3–24 letters and numbers, starting with a letter.");
      return;
    }
    setAlias(draft);
    setError("");
    toast.success("Pseudonym updated");
  }
  function perform() {
    if (confirm === "delete") clearIdentity();
    else {
      const next = `QuietFox${Math.floor(Math.random() * 900 + 100)}`;
      setAlias(next);
      setDraft(next);
      toast.success("New identity created");
    }
    setConfirm(null);
  }
  return (
    <>
      <main className="feed-column">
        <PageHeading
          title="Your space, your rules."
          subtitle="A few thoughtful settings. A little more peace of mind."
        />
        <section className="settings-section">
          <h2>Appearance</h2>
          <p>Choose your comfort style.</p>
          <div className="controls">
            {(
              [
                { name: "Sunny Light", value: "light", icon: Sun, desc: "☀️ Crisp & warm" },
                { name: "Cozy Dark", value: "dark", icon: Moon, desc: "🌙 Deep velvet slate" },
                { name: "System", value: "system", icon: Monitor, desc: "✨ Device automatic" },
              ] as const
            ).map((t) => (
              <Button
                key={t.value}
                variant={theme === t.value ? "default" : "outline"}
                className={`theme-pick-btn ${theme === t.value ? "active" : ""}`}
                onClick={() => setTheme(t.value)}
                aria-pressed={theme === t.value}
              >
                <t.icon className="size-4 mr-1.5" />
                <span>{t.name}</span>
              </Button>
            ))}
          </div>
        </section>
        <section className="settings-section">
          <h2>Your pseudonym</h2>
          <p>Your public alias is separate from any private credentials.</p>
          <label htmlFor="alias">Public alias</label>
          <input
            id="alias"
            className="text-input"
            value={draft}
            maxLength={24}
            onChange={(e) => setDraft(e.target.value)}
            aria-describedby={error ? "alias-error" : undefined}
          />
          <div className="controls">
            <Button onClick={save}>Save alias</Button>
            <Button variant="outline" onClick={() => setConfirm("rotate")}>
              <RefreshCw />
              Rotate alias
            </Button>
          </div>
          {error && (
            <p id="alias-error" role="alert" className="text-destructive mt-3">
              {error}
            </p>
          )}
          <p className="mt-3">
            Thoughts published under this pseudonym expire and get deleted automatically after 24
            hours.
          </p>
        </section>
        <section className="settings-section">
          <h2>Blocked identities</h2>
          <p>Blocked identities are hidden from your feed.</p>
          {blocked.length ? (
            blocked.map((b) => (
              <div key={b} className="setting-row mt-4">
                <span className="text-sm">{b}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    unblock(b);
                    toast.success(`${b} unblocked`);
                  }}
                >
                  Unblock
                </Button>
              </div>
            ))
          ) : (
            <p className="mt-3">No blocked identities. A fresh start.</p>
          )}
        </section>
        <section className="settings-section">
          <h2 className="flex items-center gap-2">
            <Clock3 className="size-4 text-primary" />A thought, not a permanent record.
          </h2>
          <p>{PRIVACY_NOTICE}</p>
          <p className="mt-3">
            Post expiration ensures thoughts are ephemeral. After 24 hours, all content and replies
            are automatically removed from the active network.
          </p>
          <p className="mt-3">
            All thoughts and replies dissolve automatically on schedule. Your privacy is guaranteed
            by design.
          </p>
        </section>
        <section className="settings-section">
          <h2 className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Private by intention
          </h2>
          <p>
            Your real name isn’t part of your public profile. Authentication identifiers, if used,
            remain strictly confidential.
          </p>
          <p className="mt-3">
            Keep conversations thoughtful. Don’t share private personal info, harass others, or post
            threats.
          </p>
          <div className="controls">
            <Button variant="outline" onClick={() => setOnboard(true)}>
              Revisit introduction
            </Button>
          </div>
        </section>
        <section className="settings-section">
          <div className="setting-row">
            <div>
              <h2>Reset pseudonym identity</h2>
              <p>Clears your current local posts, reactions, and preferences.</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Reset pseudonym identity"
              onClick={() => setConfirm("delete")}
            >
              <Trash2 className="text-destructive" />
            </Button>
          </div>
          <div className="controls">
            <Button variant="ghost" asChild>
              <Link to="/auth">
                <LogOut />
                Account access
              </Link>
            </Button>
          </div>
        </section>
        <Dialog
          open={confirm !== null}
          onOpenChange={(open) => {
            if (!open) setConfirm(null);
          }}
        >
          <DialogContent className="compose-dialog">
            <DialogTitle>
              {confirm === "delete" ? "Reset your local identity?" : "Start with a new pseudonym?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "delete"
                ? "Your posts, community choices, and blocked list will be cleared."
                : "Future posts will use a new generated pseudonym."}
            </DialogDescription>
            <div className="flex justify-end gap-3 mt-3">
              <Button variant="outline" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button variant={confirm === "delete" ? "destructive" : "default"} onClick={perform}>
                {confirm === "delete" ? "Reset identity" : "Rotate identity"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <Rightbar />
    </>
  );
}
export function ProfilePage() {
  const { alias, posts, setCompose } = useGhost();
  const [tab, setTab] = useState("Current posts");
  const own = posts.filter((p) => p.alias === alias);
  const activeReplies = posts.flatMap((p) =>
    p.replies.filter((r) => r.alias === alias).map((r) => ({ ...r, postId: p.id })),
  );
  return (
    <>
      <main className="feed-column">
        <PageHeading
          title="A name, not a label."
          subtitle="This is you, for now. Nothing more than it needs to be."
        />
        <div className="profile-summary">
          <GhostMark className="avatar lavender" />
          <div>
            <h2>{alias}</h2>
            <p>Pseudonymous profile · 24h ephemeral thoughts</p>
          </div>
        </div>
        <p className="text-xs leading-7 text-muted-foreground mt-4">
          Thoughts fade automatically after 24 hours. Enjoy true privacy without permanent digital
          records.
        </p>
        <div className="flex flex-wrap gap-3 my-5">
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <RefreshCw className="size-3.5 mr-1.5" />
              Manage identity
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              Privacy settings
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
        <div className="feed-tabs" role="tablist" aria-label="Your activity">
          {["Current posts", "Active replies"].map((t) => (
            <Button
              key={t}
              role="tab"
              aria-selected={tab === t}
              variant="ghost"
              className={`feed-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t} · {t === "Current posts" ? own.length : activeReplies.length}
            </Button>
          ))}
        </div>
        <div className="post-list" role="tabpanel">
          {tab === "Current posts" ? (
            own.length ? (
              own.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <EmptyState
                title="Your little corner is waiting."
                description="Your current posts will appear here until their moment has passed."
                action={() => setCompose(true)}
              />
            )
          ) : activeReplies.length ? (
            activeReplies.map((r) => (
              <Link
                to="/post/$postId"
                params={{ postId: r.postId }}
                key={r.id}
                className="popular-conversation"
              >
                <p>{r.body}</p>
                <small>
                  Open conversation
                  <ArrowRight className="inline ml-2 size-3" />
                </small>
              </Link>
            ))
          ) : (
            <EmptyState
              title="A conversation is waiting."
              description="Your active replies appear here while their parent posts are still available."
            />
          )}
        </div>
      </main>
      <Rightbar />
    </>
  );
}
