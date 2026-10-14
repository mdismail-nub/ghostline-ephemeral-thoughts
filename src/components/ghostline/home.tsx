import { useState } from "react";
import { Flame, Clock3, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGhost } from "./store";
import { Composer } from "./composer";
import { PostCard } from "./post-card";
import { WelcomeBanner } from "./welcome-banner";
import { PageHeading, Rightbar, EmptyState } from "./layout";
import { discoveryTopics as topics } from "@/lib/topic-catalog";
export function HomeFeed() {
  const { posts, ready, topic, setTopic, setCompose } = useGhost();
  const [tab, setTab] = useState("Recent");
  const filtered = posts
    .filter((p) => topic === "All topics" || p.topic === topic)
    .sort((a, b) =>
      tab === "Recent"
        ? b.createdAt - a.createdAt
        : b.reactions.reduce((s, r) => s + r.count, 0) -
          a.reactions.reduce((s, r) => s + r.count, 0),
    );
  return (
    <>
      <main className="feed-column">
        <PageHeading title="Hello, thoughtful you." subtitle="What’s on your mind today?" live />
        <WelcomeBanner />
        <Composer />
        <div className="feed-tabs" role="tablist" aria-label="Feed order">
          {["Recent", "Trending"].map((t) => (
            <Button
              role="tab"
              aria-selected={tab === t}
              key={t}
              variant="ghost"
              className={`feed-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "Recent" ? <Clock3 /> : <Flame />}
              {t}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-1.5 min-w-0">
            {topic !== "All topics" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTopic("All topics")}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                title="Show all topics"
              >
                Clear
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`filter-button text-xs gap-1.5 h-8.5 px-3 rounded-lg border transition-colors ${
                    topic !== "All topics"
                      ? "bg-accent/80 text-primary-ink border-primary/20 font-semibold"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Filter feed by topic"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {topic === "All topics" ? "All topics" : `#${topic.toLowerCase()}`}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 max-h-72 overflow-y-auto">
                {["All topics", ...topics.map((t) => t.name)].map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onSelect={() => setTopic(t)}
                    className="text-xs cursor-pointer"
                  >
                    <span>{t === "All topics" ? "All topics" : `#${t.toLowerCase()}`}</span>
                    {topic === t && <Check className="ml-auto size-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="post-list" role="tabpanel" aria-label={`${tab} conversations`}>
          {!ready ? (
            Array.from({ length: 3 }, (_, i) => (
              <div className="skeleton-card" key={i} aria-label="Loading conversations">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
                <div className="skeleton-line medium" />
              </div>
            ))
          ) : filtered.length ? (
            filtered.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <EmptyState
              title={
                topic === "All topics"
                  ? "No thoughts here yet."
                  : `No thoughts in #${topic.toLowerCase()} yet.`
              }
              description="Start a conversation. Your session’s posts will appear here."
              action={() => setCompose(true)}
            />
          )}
        </div>
      </main>
      <Rightbar />
    </>
  );
}
