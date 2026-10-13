import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sun,
  Moon,
  Monitor,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Ban,
  UserRound,
  Palette,
  ArrowRight,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import { PageHeading, Rightbar, EmptyState } from "./layout";
import { GhostMark } from "./icons";
import { PostCard } from "./post-card";
import { CuteAvatar } from "./cute-avatar";
import { isValidAlias } from "@/lib/pseudonym";
import { PRIVACY_NOTICE } from "@/lib/services/mock";
import conversationIcon from "@/assets/conversation.png";
import fadingIcon from "@/assets/fading.png";
import privacyIcon from "@/assets/privacy.png";
const sections = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: UserRound },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "blocked", label: "Blocked users", icon: Ban },
  { id: "data", label: "Data & deletion", icon: Trash2 },
] as const;
type Section = (typeof sections)[number]["id"];
export function SettingsPage() {
  const {
    theme,
    setTheme,
    alias,
    setAlias,
    rotateAlias,
    blocked,
    unblock,
    clearIdentity,
    setOnboard,
  } = useGhost();
  const [section, setSection] = useState<Section>("appearance");
  const [draft, setDraft] = useState(alias);
  const [confirm, setConfirm] = useState<"rotate" | "reset" | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setDraft(alias);
  }, [alias]);
  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidAlias(draft)) {
      setError("Use 3–24 letters, numbers or underscores. Keep it friendly.");
      return;
    }
    setAlias(draft);
    setError("");
    toast.success("Pseudonym updated for this session");
  }
  return (
    <main className="settings-main">
      <PageHeading
        title="Settings"
        subtitle="Make yourself comfortable. Keep control of your space."
      />
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {sections.map((s) => (
            <Button
              key={s.id}
              variant="ghost"
              className={section === s.id ? "selected" : ""}
              aria-current={section === s.id ? "page" : undefined}
              onClick={() => setSection(s.id)}
            >
              <s.icon />
              {s.label}
            </Button>
          ))}
        </nav>
        <label className="settings-mobile-selector">
          <span>Settings section</span>
          <select
            value={section}
            onChange={(e) => {
              const next = sections.find((s) => s.id === e.target.value);
              if (next) setSection(next.id);
            }}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div className="settings-content">
          {section === "appearance" && (
            <section className="settings-section">
              <h2>Appearance</h2>
              <p>Choose a look that feels right. Saved on this device.</p>
              <div className="appearance-options" role="group" aria-label="Appearance">
                {(
                  [
                    { value: "light", label: "Light", desc: "Soft and bright", icon: Sun },
                    { value: "dark", label: "Dark", desc: "Easy on the eyes", icon: Moon },
                    { value: "system", label: "System", desc: "Follow your device", icon: Monitor },
                  ] as const
                ).map((t) => (
                  <Button
                    key={t.value}
                    variant="outline"
                    className={`appearance-option ${theme === t.value ? "selected" : ""}`}
                    aria-pressed={theme === t.value}
                    onClick={() => setTheme(t.value)}
                  >
                    <t.icon />
                    <span>
                      <strong>{t.label}</strong>
                      <small>{t.desc}</small>
                    </span>
                  </Button>
                ))}
              </div>
              <div className="settings-note">
                <Monitor />
                <p>System appearance follows your device’s light or dark preference.</p>
              </div>
            </section>
          )}
          {section === "account" && (
            <section className="settings-section">
              <h2>Account</h2>
              <p>Your pseudonym is public. No real-name profile is needed.</p>
              <form onSubmit={save} className="alias-form">
                <label htmlFor="alias">Public pseudonym</label>
                <input
                  id="alias"
                  className="text-input"
                  value={draft}
                  maxLength={24}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "alias-error" : "alias-help"}
                />
                <p id="alias-help">3–24 letters and numbers. Changes apply to this session.</p>
                {error && (
                  <p id="alias-error" role="alert" className="text-destructive">
                    {error}
                  </p>
                )}
                <div className="controls">
                  <Button type="submit" disabled={draft === alias}>
                    Save pseudonym
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setConfirm("rotate")}>
                    <RefreshCw />
                    Rotate alias
                  </Button>
                </div>
              </form>
              <dl className="account-details">
                <div>
                  <dt>Session</dt>
                  <dd>Preview · not signed in</dd>
                </div>
                <div>
                  <dt>Identity retention</dt>
                  <dd>Until this page is reloaded; no account timer is configured.</dd>
                </div>
              </dl>
              <div className="settings-note">
                <ShieldCheck />
                <p>Sign-in and sign-out are unavailable. No account service is connected.</p>
              </div>
              <Button variant="link" asChild>
                <Link to="/auth">
                  Account availability
                  <ArrowRight />
                </Link>
              </Button>
            </section>
          )}
          {section === "privacy" && (
            <section className="settings-section">
              <h2>Privacy</h2>
              <p>{PRIVACY_NOTICE}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 p-1">
                    <img src={conversationIcon} alt="" className="size-full object-contain" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-foreground">Thoughts & Words</span>
                    <span className="text-muted-foreground">Share freely without real names</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 p-1">
                    <img src={fadingIcon} alt="" className="size-full object-contain" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-foreground">24h Ephemeral</span>
                    <span className="text-muted-foreground">Expires naturally after a day</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 p-1">
                    <img src={privacyIcon} alt="" className="size-full object-contain" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold block text-foreground">Private & Safe</span>
                    <span className="text-muted-foreground">No tracking or user profiling</span>
                  </div>
                </div>
              </div>
              <dl className="privacy-details">
                <div>
                  <dt>Posts, replies & reactions</dt>
                  <dd>
                    Posts have a 24-hour lifetime. Replies and reactions become unavailable with
                    their parent post.
                  </dd>
                </div>
                <div>
                  <dt>What this preview stores</dt>
                  <dd>
                    Posts, pseudonyms, reactions, replies, memberships and blocked identities are
                    held in memory for this session. Only appearance and onboarding preferences are
                    stored on your device.
                  </dd>
                </div>
                <div>
                  <dt>Expiration is not physical deletion</dt>
                  <dd>
                    This preview filters expired content; it has no server-side authorization,
                    scheduled cleanup or backup deletion. Those require a connected service.
                  </dd>
                </div>
                <div>
                  <dt>Identity & external copies</dt>
                  <dd>
                    No permanent account lifecycle is configured. Pseudonyms are not a guarantee of
                    anonymity, and external copies cannot be removed by Unsaid.
                  </dd>
                </div>
                <div>
                  <dt>Community conduct</dt>
                  <dd>
                    Respect others. Do not publish private personal information, harassment or
                    threats. Reporting is unavailable until moderation is connected.
                  </dd>
                </div>
              </dl>
              <Button variant="outline" onClick={() => setOnboard(true)}>
                Revisit introduction
              </Button>
            </section>
          )}
          {section === "blocked" && (
            <section className="settings-section">
              <h2>Blocked users</h2>
              <p>Hide these pseudonyms and their replies for this session.</p>
              {blocked.length ? (
                <ul className="blocked-list">
                  {blocked.map((b) => (
                    <li key={b}>
                      <div className="flex min-w-0 items-center gap-3">
                        <CuteAvatar alias={b} size="sm" showSparkle={false} />
                        <span className="truncate">{b}</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          unblock(b);
                          toast.success(`${b} unblocked for this session`);
                        }}
                      >
                        Unblock
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="settings-empty">
                  <Ban />
                  <h3>No blocked users</h3>
                  <p>Blocked pseudonyms will appear here.</p>
                </div>
              )}
            </section>
          )}
          {section === "data" && (
            <section className="settings-section">
              <h2>Data & deletion</h2>
              <p>Manage this session’s content and preferences.</p>
              <div className="deletion-row">
                <h3>Reset session identity</h3>
                <p>
                  Removes your posts, replies and reactions from this session, resets your
                  pseudonym, and clears memberships and blocked users. Your saved appearance is
                  kept.
                </p>
                <Button variant="destructive" onClick={() => setConfirm("reset")}>
                  <Trash2 />
                  Reset session identity
                </Button>
              </div>
              <div className="deletion-row">
                <h3>Delete account</h3>
                <p>
                  Unavailable: this preview has no registered accounts or permanent account-deletion
                  service.
                </p>
                <Button variant="outline" disabled>
                  Delete account unavailable
                </Button>
              </div>
              <div className="deletion-row">
                <h3>Welcome experience & onboarding</h3>
                <p>
                  Replay the 3-step introductory tour or restore the friendly welcome banner on the
                  home feed.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOnboard(true);
                      toast.success("Welcome tour launched");
                    }}
                    className="gap-2"
                  >
                    <HelpCircle className="size-4 text-primary" />
                    <span>Replay welcome tour</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      localStorage.removeItem("unsaid-feed-banner-dismissed");
                      localStorage.removeItem("ghostline-feed-banner-dismissed");
                      localStorage.removeItem("unsaid-onboarded");
                      localStorage.removeItem("ghostline-onboarded");
                      toast.success("Feed banner & onboarding restored! Reload or visit Home.");
                    }}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-4" />
                    <span>Restore feed banner</span>
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <DialogContent className="compose-dialog">
          <DialogTitle>
            {confirm === "reset" ? "Reset this session’s identity?" : "Choose a new pseudonym?"}
          </DialogTitle>
          <DialogDescription>
            {confirm === "reset"
              ? "Your session posts, replies, reactions, memberships and blocked list will be cleared. This cannot be undone."
              : "Future posts use a new random pseudonym. Existing posts keep their original alias."}
          </DialogDescription>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm === "reset" ? "destructive" : "default"}
              onClick={() => {
                if (confirm === "reset") clearIdentity();
                else {
                  rotateAlias();
                }
                setConfirm(null);
              }}
            >
              {confirm === "reset" ? "Reset session" : "Rotate alias"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
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
        <PageHeading title="Your profile" subtitle="Your posts and replies in this session." />
        <div className="profile-summary">
          <CuteAvatar alias={alias} size="lg" />
          <div>
            <h2>{alias}</h2>
            <p>Session-only pseudonym</p>
          </div>
        </div>
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
                title="No posts yet."
                description="Write something to start a conversation."
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
              title="No replies yet."
              description="Join a conversation to see your replies here."
            />
          )}
        </div>
      </main>
      <Rightbar />
    </>
  );
}
