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
import { GhostMark, TopicIcon } from "./icons";
import { ComposeDialog } from "./composer";
import { Onboarding } from "./onboarding";
import { discoveryTopics } from "@/lib/topic-catalog";
import emptyArt from "@/assets/conversation.png";
const destinations = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/explore" as const, label: "Explore", icon: Compass },
  { to: "/communities" as const, label: "Communities", icon: Users },
];
export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { theme, setTheme, alias, setCompose, setOnboard, posts } = useGhost();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = query.trim()
    ? posts.filter((p) =>
        `${p.body} ${p.alias} ${p.topic}`.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : [];
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Ghostline home">
          <GhostMark />
          <span>ghostline</span>
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
            aria-label="Search Ghostline"
            title="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search />
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
                Session-only preview
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
                Search
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOnboard(true)} className="cursor-pointer">
                <Sparkles className="text-primary" />
                <span>Welcome tour</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings />
                  Settings
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
          <DialogTitle>Search Ghostline</DialogTitle>
          <DialogDescription>Find a topic or an available conversation.</DialogDescription>
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
      <Toaster position="bottom-right" />
    </div>
  );
}
export function Rightbar() {
  const { posts, setTopic } = useGhost();
  const trending = discoveryTopics
    .map((t) => ({ ...t, count: posts.filter((p) => p.topic === t.name).length }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  return (
    <aside className="rightbar">
      <section className="right-section">
        <h2 className="section-title">
          <TrendingUp />
          Active topics
        </h2>
        {trending.length ? (
          trending.map((t) => (
            <Link key={t.name} to="/" onClick={() => setTopic(t.name)} className="trending-topic">
              <span className="topic-icon lavender">
                <TopicIcon name={t.name} />
              </span>
              <div>
                <h3>{t.name}</h3>
                <p>
                  {t.count} conversation{t.count === 1 ? "" : "s"}
                </p>
              </div>
              <ArrowUpRight />
            </Link>
          ))
        ) : (
          <p className="muted-copy">A fresh start. Find a topic you like.</p>
        )}
        <Button variant="link" asChild className="view-all">
          <Link to="/explore">
            Explore topics
            <ArrowRight />
          </Link>
        </Button>
      </section>
      <div className="right-footer">
        <Link to="/settings">Privacy & preferences</Link>
        <p>Ghostline · Session-only preview</p>
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
        alt="A friendly ghost with a little thought to share"
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
