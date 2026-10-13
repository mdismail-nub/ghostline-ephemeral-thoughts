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
        <PageHeading
          title="Your little corner."
          subtitle="A few fresh thoughts. A little good company."
          live
        />
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="filter-button" aria-label="Filter feed by topic">
                {topic}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["All topics", ...topics.map((t) => t.name)].map((t) => (
                <DropdownMenuItem key={t} onSelect={() => setTopic(t)}>
                  {t}
                  {topic === t && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              description="Everything on Ghostline is deleted automatically after 24 hours. Drop the first thought today!"
              action={() => setCompose(true)}
            />
          )}
        </div>
      </main>
      <Rightbar />
    </>
  );
}
