import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  Compass,
  Users,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  Settings,
  UserRound,
  LogIn,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Heart,
  Clock3,
  Monitor,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { useGhost } from "./store";
import { GhostMark, TopicIcon } from "./icons";
import { ComposeDialog } from "./composer";
import { Onboarding } from "./onboarding";
import { topics } from "@/lib/services/mock";
import emptyArt from "@/assets/cozy-thought.jpg";
import type { ReactNode } from "react";
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { theme, setTheme, alias, setCompose, topic, setTopic } = useGhost();
  const nav = [
    { to: "/" as const, label: "Home", icon: Home },
    { to: "/explore" as const, label: "Explore", icon: Compass },
    { to: "/communities" as const, label: "Communities", icon: Users },
  ];
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Ghostline home">
          <GhostMark />
          ghostline<span className="sr-only">Anonymous text conversations</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`nav-link ${pathname === n.to ? "active" : ""}`}>
              <n.icon />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Button className="compose-button" onClick={() => setCompose(true)}>
            <Plus />
            <span className="compose-label">Share thought</span>
          </Button>
          {/* Pookie-style stylish theme switcher */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="pookie-theme-toggle"
            aria-label={`Toggle theme: currently ${theme}. Switch to ${theme === "dark" ? "Sunny Light" : "Cozy Dark"}`}
            title={
              theme === "dark"
                ? "🌙 Cozy Night · Switch to ☀️ Sunny Day"
                : "☀️ Sunny Day · Switch to 🌙 Cozy Night"
            }
          >
            <span className="pookie-track">
              <span className={`pookie-knob ${theme === "dark" ? "knob-dark" : "knob-light"}`}>
                {theme === "dark" ? (
                  <Moon className="pookie-icon moon" />
                ) : (
                  <Sun className="pookie-icon sun" />
                )}
              </span>
              <span className="pookie-side-icon sun-side" aria-hidden="true">
                <Sun className="size-3" />
              </span>
              <span className="pookie-side-icon moon-side" aria-hidden="true">
                <Sparkles className="size-2.5" />
              </span>
            </span>
          </button>
          <span className="nav-divider" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="profile-trigger" aria-label="Your identity menu">
                <GhostMark className="avatar lavender" />
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-semibold">{alias}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Anonymous identity · 24h lifetime
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun /> : <Moon />}
                {theme === "dark" ? "Switch to Sunny Light" : "Switch to Cozy Dark"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("system")}>
                <Monitor />
                System appearance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserRound />
                  My pseudonym
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/auth">
                  <LogIn />
                  Sign in
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <p className="sidebar-heading">YOUR SPACE</p>
          <nav className="sidebar-links" aria-label="Your space">
            {nav.map((n) => (
              <Button
                variant="ghost"
                asChild
                key={n.to}
                className={`sidebar-link ${pathname === n.to ? "active" : ""}`}
              >
                <Link to={n.to}>
                  <n.icon />
                  {n.label === "Home"
                    ? "Your feed"
                    : n.label === "Explore"
                      ? "Explore topics"
                      : n.label}
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              asChild
              className={`sidebar-link ${pathname === "/profile" ? "active" : ""}`}
            >
              <Link to="/profile">
                <UserRound />
                My identity
              </Link>
            </Button>
          </nav>
          <div className="sidebar-section">
            <p className="sidebar-heading">TOPICS TO WANDER</p>
            <div className="sidebar-links sidebar-topics">
              {topics.map((t) => (
                <Button
                  key={t.name}
                  variant="ghost"
                  className={`sidebar-link sidebar-topic ${topic === t.name ? "active" : ""}`}
                  asChild
                >
                  <Link to="/" activeProps={{ className: "" }} onClick={() => setTopic(t.name)}>
                    <span className={`topic-dot ${t.tone}`} />
                    {t.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <Button variant="ghost" asChild className="sidebar-link">
              <Link to="/settings">
                <Settings />
                Settings & privacy
              </Link>
            </Button>
          </div>
          <div className="sidebar-footer">
            <p>A thought, not a footprint.</p>
            <Link to="/settings" className="privacy-link">
              Private by intention. <ArrowUpRight className="inline size-3" />
            </Link>
            <p className="ephemeral-badge">Ephemeral · 24h lifetime</p>
          </div>
        </aside>
        {children}
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link to="/" className={pathname === "/" ? "active" : ""}>
          <Home />
          Home
        </Link>
        <Link to="/explore" className={pathname === "/explore" ? "active" : ""}>
          <Compass />
          Explore
        </Link>
        <Button variant="ghost" className="mobile-compose" onClick={() => setCompose(true)}>
          <Plus />
          Compose
        </Button>
        <Link
          to="/profile"
          className={pathname === "/profile" || pathname === "/settings" ? "active" : ""}
        >
          <UserRound />
          Identity
        </Link>
      </nav>
      <ComposeDialog />
      <Onboarding />
      <Toaster position="bottom-right" />
    </div>
  );
}
export function Rightbar() {
  const { posts, setTopic, setCompose } = useGhost();
  return (
    <aside className="rightbar">
      <section className="right-section">
        <h2 className="section-title">
          <TrendingUp />
          Trending right now
        </h2>
        {["Life", "Ideas", "Technology", "University"].map((name) => {
          const t = topics.find((t) => t.name === name);
          return (
            <Link key={name} to="/" onClick={() => setTopic(name)} className="trending-topic">
              <span className={`topic-icon ${t?.tone}`}>
                <TopicIcon name={name} />
              </span>
              <div>
                <h3>{name}</h3>
                <p>{posts.filter((p) => p.topic === name).length} active conversations</p>
              </div>
              <ArrowUpRight />
            </Link>
          );
        })}
        <Button variant="link" className="view-all" asChild>
          <Link to="/explore">
            Explore all topics
            <ArrowRight />
          </Link>
        </Button>
      </section>
      <DailyQuestion />
      <section className="quiet-card">
        <ShieldCheck />
        <h3>A space to just be.</h3>
        <p>
          No followers. No highlight reels.
          <br />
          Just thoughts, and the people behind them.
        </p>
        <Button variant="link" className="view-all" asChild>
          <Link to="/settings">
            Our privacy promise
            <ArrowRight />
          </Link>
        </Button>
      </section>
      <div className="right-footer">
        <Link to="/settings">Privacy</Link>
        <Link to="/settings">Community guidelines</Link>
        <p>© 2026 Ghostline · Made for the moment.</p>
      </div>
    </aside>
  );
}
export function DailyQuestion() {
  const { setCompose } = useGhost();
  return (
    <section className="daily-question">
      <h2 className="section-title">
        <Sparkles />
        THE DAILY QUESTION
      </h2>
      <h3>What’s a small thing that made your day better?</h3>
      <p>There’s no wrong answer.</p>
      <Button onClick={() => setCompose(true)}>
        Share your answer
        <ArrowUpRight />
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
        alt="A friendly ghost with a little thought to share"
      />
      <h2>{title}</h2>
      <p>{description}</p>
      {action && (
        <Button onClick={action} className="empty-action-btn">
          <Plus className="size-4" />
          <span>Drop a thought</span>
        </Button>
      )}
    </div>
  );
}
export function PageHeading({
  title,
  subtitle,
  live = false,
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
      {live && <span className="live-pill">Here, for now</span>}
    </div>
  );
}
