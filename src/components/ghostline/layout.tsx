import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  Compass,
  Users,
  Sun,
  Moon,
  Monitor,
  Search,
  Menu,
  Settings,
  UserRound,
  LogIn,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Plus,
  Bell,
  ShieldAlert,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CuteAvatar } from "./cute-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { useGhost } from "./store";
import { UnsaidMark, TopicIcon } from "./icons";
import { ComposeDialog } from "./composer";
import { Onboarding } from "./onboarding";
import { CreatorAlertDialog } from "./creator-alert-dialog";
import { discoveryTopics } from "@/lib/topic-catalog";
import emptyArt from "@/assets/conversation.png";
const destinations = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/explore" as const, label: "Explore", icon: Compass },
  { to: "/communities" as const, label: "Communities", icon: Users },
];
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const {
    theme,
    setTheme,
    alias,
    setCompose,
    setOnboard,
    posts,
    alerts,
    unreadAlertCount,
    activeAlertModal,
    setActiveAlertModal,
  } = useGhost();
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? posts.filter((p) =>
        `${p.body} ${p.alias} ${p.topic}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Unsaid home">
          <UnsaidMark />
          <span>unsaid</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {destinations.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "active" }}
              className="nav-link"
            >
              <n.icon />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Button
            variant="ghost"
            size="icon"
            className="search-trigger"
            aria-label="Search Unsaid"
            title="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search />
          </Button>

          {/* Privacy & Moderation Alerts Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative alerts-trigger hover:bg-accent/80 rounded-xl"
            aria-label="Moderation and Privacy alerts"
            title="Privacy Alerts"
            onClick={() => {
              setAlertsOpen(true);
              if (activeAlertModal) setActiveAlertModal(null);
            }}
          >
            <Bell className="w-4 h-4 text-foreground/80" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="theme-trigger"
                aria-label="Choose appearance"
                title="Appearance"
              >
                {theme === "system" ? <Monitor /> : theme === "dark" ? <Moon /> : <Sun />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              {(
                [
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ] as const
              ).map((t) => (
                <DropdownMenuItem key={t.value} onSelect={() => setTheme(t.value)}>
                  <t.icon />
                  {t.label}
                  {theme === t.value && <span className="ml-auto text-xs">Selected</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="profile-trigger" aria-label="Your identity menu">
                <CuteAvatar alias={alias} size="sm" showSparkle={false} />
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{alias}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Anonymous pseudonym
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserRound />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings />
                  Settings & privacy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAlertsOpen(true)} className="cursor-pointer">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Privacy alerts</span>
                {unreadAlertCount > 0 && (
                  <span className="ml-auto text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                    {unreadAlertCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOnboard(true)} className="cursor-pointer">
                <Sparkles className="text-primary" />
                <span>Welcome tour</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/auth">
                  <LogIn />
                  Account access · unavailable
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mobile-menu-trigger"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {destinations.map((n) => (
                <DropdownMenuItem asChild key={n.to}>
                  <Link to={n.to} aria-current={pathname === n.to ? "page" : undefined}>
                    <n.icon />
                    {n.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSearchOpen(true)}>
                <Search />
                <span>Search</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAlertsOpen(true)}>
                <Bell />
                <span>Privacy alerts</span>
                {unreadAlertCount > 0 && (
                  <span className="ml-auto text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                    {unreadAlertCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOnboard(true)} className="cursor-pointer">
                <Sparkles className="text-primary" />
                <span>Welcome tour</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="cursor-pointer"
              >
                {theme === "dark" ? <Sun /> : <Moon />}
                <span>Switch to {theme === "dark" ? "light" : "dark"} mode</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings />
                  <span>Settings & privacy</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className={`workspace ${pathname === "/settings" ? "workspace-settings" : ""}`}>
        {children}
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="search-dialog">
          <DialogTitle>Search Unsaid</DialogTitle>
          <DialogDescription>Find a topic or an anonymous conversation.</DialogDescription>
          <label className="search-field">
            <Search />
            <span className="sr-only">Search active content</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search thoughts, topics or pseudonyms…"
            />
          </label>
          <div className="search-results">
            {query.trim() ? (
              <>
                {discoveryTopics
                  .filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()))
                  .map((t) => (
                    <Link
                      key={t.name}
                      to="/explore"
                      onClick={() => setSearchOpen(false)}
                      className="search-result"
                    >
                      <Compass />
                      <span>{t.name}</span>
                      <ArrowRight />
                    </Link>
                  ))}
                {results.map((p) => (
                  <Link
                    key={p.id}
                    to="/post/$postId"
                    params={{ postId: p.id }}
                    onClick={() => setSearchOpen(false)}
                    className="search-result"
                  >
                    <span>
                      <strong>{p.alias}</strong>
                      <p>{p.body}</p>
                    </span>
                    <ArrowRight />
                  </Link>
                ))}
                {!results.length &&
                  !discoveryTopics.some((t) =>
                    t.name.toLowerCase().includes(query.trim().toLowerCase()),
                  ) && <p className="muted-copy">No matches. Try another word.</p>}
              </>
            ) : (
              <p className="muted-copy">Search your current session’s conversations.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ComposeDialog />
      <Onboarding />
      <CreatorAlertDialog
        open={alertsOpen || Boolean(activeAlertModal)}
        onOpenChange={(open) => {
          setAlertsOpen(open);
          if (!open && activeAlertModal) {
            setActiveAlertModal(null);
          }
        }}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}
export function Rightbar() {
  const { posts, setTopic } = useGhost();
  const withCounts = discoveryTopics.map((t) => ({
    ...t,
    count: posts.filter((p) => p.topic === t.name).length,
  }));
  const activeTrending = withCounts
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const displayTopics = activeTrending.length >= 2 ? activeTrending : withCounts.slice(0, 4);

  return (
    <aside className="rightbar" aria-label="Discovery & Community">
      <div className="rightbar-inner">
        {/* Daily Question Spotlight */}
        <section className="rightbar-card rightbar-daily-question">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1.5">
            <Sparkles className="size-3.5 text-primary-ink dark:text-primary" />
            <span>Today's Reflection</span>
          </div>
          <h3 className="text-sm font-bold text-foreground leading-snug">
            What’s a small thing that made your day better?
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
            Share a kind reflection or a cozy win with the community.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs font-semibold rounded-xl gap-1.5 h-8 bg-card/90 hover:bg-card border-border/80 text-foreground"
            asChild
          >
            <Link to="/" onClick={() => setTopic("Daily Question")}>
              <span>Join conversation</span>
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </section>

        {/* Active Topics Card */}
        <section className="rightbar-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="size-3.5 text-primary" />
              <span>Active Topics</span>
            </h2>
            <Link
              to="/explore"
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5"
            >
              <span>Explore</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-1.5">
            {displayTopics.map((t) => (
              <Link
                key={t.name}
                to="/"
                onClick={() => setTopic(t.name)}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/70 transition-colors group text-decoration-none"
              >
                <span
                  className={`topic-icon ${t.tone || "lavender"} size-7 rounded-lg shrink-0 flex items-center justify-center`}
                >
                  <TopicIcon name={t.name} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    #{t.name.toLowerCase()}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {t.count ? `${t.count} thought${t.count === 1 ? "" : "s"}` : t.description}
                  </p>
                </div>
                <ArrowUpRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Cozy Ephemeral & Privacy Card */}
        <section className="rightbar-card rightbar-privacy-card">
          <div className="flex items-center gap-1.5 mb-1.5 text-foreground">
            <ShieldAlert className="size-3.5 text-primary" />
            <span className="text-xs font-bold">24-Hour Ephemeral</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All thoughts vanish strictly after 24 hours. Cute pseudonyms protect your identity.
          </p>
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/60 text-[11px]">
            <Link to="/settings" className="text-primary hover:underline font-medium">
              Privacy settings
            </Link>
            <span className="text-muted-foreground/80">Unsaid</span>
          </div>
        </section>
      </div>
    </aside>
  );
}
export function DailyQuestion() {
  const { setTopic } = useGhost();
  return (
    <section className="daily-question">
      <h2 className="section-title">Daily Question</h2>
      <h3>What’s a small thing that made your day better?</h3>
      <Button variant="outline" asChild>
        <Link to="/" onClick={() => setTopic("Daily Question")}>
          Join the conversation
          <ArrowUpRight />
        </Link>
      </Button>
    </section>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: () => void;
}) {
  return (
    <div className="empty-state">
      <img
        className="empty-illustration"
        src={emptyArt}
        width={1024}
        height={1024}
        loading="lazy"
        alt="A cozy thought to share"
      />
      <h2>{title}</h2>
      <p>{description}</p>
      {action && (
        <Button onClick={action}>
          <Plus />
          Write a post
        </Button>
      )}
    </div>
  );
}
export function PageHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
  live?: boolean;
}) {
  return (
    <div className="page-heading">
      <div className="min-w-0">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
