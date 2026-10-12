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
    toast.success("Preview pseudonym updated");
  }
  function perform() {
    if (confirm === "delete") clearIdentity();
    else {
      const next = `QuietFox${Math.floor(Math.random() * 900 + 100)}`;
      setAlias(next);
      setDraft(next);
      toast.success("New preview identity created");
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
          <p>Make yourself comfortable.</p>
          <div className="controls">
            {(
              [
                { name: "Light", value: "light", icon: Sun },
                { name: "Dark", value: "dark", icon: Moon },
                { name: "System", value: "system", icon: Monitor },
              ] as const
            ).map((t) => (
              <Button
                key={t.value}
                variant={theme === t.value ? "default" : "outline"}
                onClick={() => setTheme(t.value)}
                aria-pressed={theme === t.value}
              >
                <t.icon />
                {t.name}
              </Button>
            ))}
          </div>
        </section>
        <section className="settings-section">
          <h2>Your pseudonym</h2>
          <p>Your public alias is separate from any private sign-in information.</p>
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
              Rotate identity
            </Button>
          </div>
          {error && (
            <p id="alias-error" role="alert" className="text-destructive mt-3">
              {error}
            </p>
          )}
          <p className="mt-3">
            Preview identities last only for this visit. Automatic account retention and session
            invalidation are not connected yet.
          </p>
        </section>
        <section className="settings-section">
          <h2>Blocked identities</h2>
          <p>Blocked identities are hidden from your feed in this preview.</p>
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
            Post expiration and account deletion are different. Expiration makes a post and its
            replies unavailable. Account deletion removes identity associations and ends active
            sessions.
          </p>
          <p className="mt-3">
            This preview hides expired sample content. Server-recorded publication, immediate API
            expiration, scheduled cleanup, and identity retention will require a connected service.
          </p>
        </section>
        <section className="settings-section">
          <h2 className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Private by intention
          </h2>
          <p>
            Your real name isn’t part of your public profile. This does not mean you are completely
            anonymous to Ghostline. Authentication identifiers, if used, remain private.
          </p>
          <p className="mt-3">
            Keep conversations thoughtful. Don’t share private information, harass others, or post
            threats. Report harmful content using a post’s menu; reports here are local
            demonstrations only.
          </p>
          <div className="controls">
            <Button variant="outline" onClick={() => setOnboard(true)}>
              Revisit the welcome
            </Button>
          </div>
        </section>
        <section className="settings-section">
          <div className="setting-row">
            <div>
              <h2>Reset preview identity</h2>
              <p>
                No real account exists yet. This clears your current local posts and preferences,
                not a production account.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Reset preview identity"
              onClick={() => setConfirm("delete")}
            >
              <Trash2 className="text-destructive" />
            </Button>
          </div>
          <div className="controls">
            <Button variant="ghost" asChild>
              <Link to="/auth">
                <LogOut />
                Sign-in preview
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
              {confirm === "delete"
                ? "Reset this preview identity?"
                : "Start with a new pseudonym?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "delete"
                ? "Your preview posts, community choices, and blocked list will be cleared. This is not production account deletion."
                : "Your current preview posts keep their original alias. Future posts will use a new generated pseudonym."}
            </DialogDescription>
            <div className="flex justify-end gap-3 mt-3">
              <Button variant="outline" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button variant={confirm === "delete" ? "destructive" : "default"} onClick={perform}>
                {confirm === "delete" ? "Reset preview" : "Rotate identity"}
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
            <p>Pseudonymous · Temporary preview identity</p>
          </div>
        </div>
        <p className="text-xs leading-7 text-muted-foreground mt-5">
          Your current thoughts fade after 24 hours. This preview identity resets when you reload;
          account retention is not connected.
        </p>
        <div className="flex gap-3 my-5">
          <Button variant="outline" asChild>
            <Link to="/settings">
              <RefreshCw />
              Manage identity
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/settings">
              Privacy settings
              <ArrowRight />
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
                title="Nothing left behind. Yet."
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
