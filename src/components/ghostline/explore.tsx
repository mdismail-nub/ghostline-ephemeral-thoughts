import { useState } from "react";
import { Search, ArrowUpRight, Flame, Check, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useGhost } from "./store";
import { TopicIcon } from "./icons";
import { PageHeading, EmptyState, DailyQuestion } from "./layout";
import { discoveryTopics as topics } from "@/lib/topic-catalog";
export function Explore({ communities = false }: { communities?: boolean }) {
  const { posts, joined, join, setTopic } = useGhost();
  const [search, setSearch] = useState("");
  const selected = topics.filter((t) =>
    (t.name + " " + t.description).toLowerCase().includes(search.toLowerCase()),
  );
  const matching = search.trim()
    ? posts.filter((p) =>
        (p.body + " " + p.topic + " " + p.alias).toLowerCase().includes(search.toLowerCase()),
      )
    : [];
  return (
    <main className="discovery-main">
      <PageHeading
        title={communities ? "Find your people." : "Follow your curiosity."}
        subtitle={
          communities
            ? "Shared interests. Fresh perspectives. No public membership lists."
            : "Wander into a topic. You might find a thought that stays with you."
        }
        live
      />
      <label className="search-field">
        <Search />
        <span className="sr-only">
          {communities ? "Search communities" : "Search topics and conversations"}
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={communities ? "Find a community…" : "Search topics and conversations…"}
        />
      </label>
      <h2 className="subheading">
        {communities ? "Your next conversation starts here" : "Topics to wander into"}
      </h2>
      {selected.length ? (
        <div className="topic-grid">
          {selected.map((t) => {
            const count = posts.filter((p) => p.topic === t.name).length;
            return (
              <article key={t.name} className={`topic-card topic-card-${t.tone}`}>
                <span className={`topic-icon ${t.tone}`}>
                  <TopicIcon name={t.name} />
                </span>
                <h2>{t.name}</h2>
                <p>{t.description}</p>
                <div className="topic-card-bottom">
                  <span className={count ? "discussion-live" : ""}>
                    {count
                      ? `${count} active discussion${count === 1 ? "" : "s"}`
                      : "No discussions yet"}
                  </span>
                  {communities ? (
                    <Button
                      variant={joined.includes(t.name) ? "secondary" : "outline"}
                      onClick={() => join(t.name)}
                    >
                      {joined.includes(t.name) ? <Check /> : <Plus />}
                      {joined.includes(t.name) ? "Joined" : "Join"}
                    </Button>
                  ) : (
                    <Button variant="ghost" asChild>
                      <Link to="/" onClick={() => setTopic(t.name)}>
                        Explore
                        <ArrowUpRight />
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No topics found."
          description="Try another word. There’s a whole world of conversations to explore."
        />
      )}
      {search && matching.length > 0 && (
        <>
          <h2 className="subheading">Active conversations</h2>
          <div className="post-list">
            {matching.map((p) => (
              <Link
                key={p.id}
                to="/post/$postId"
                params={{ postId: p.id }}
                className="popular-conversation"
              >
                <h3 className="text-xs font-semibold">
                  {p.alias} · {p.topic}
                </h3>
                <p>{p.body}</p>
                <small>{p.replies.length} replies · Available for a little longer</small>
              </Link>
            ))}
          </div>
        </>
      )}
      {!communities && !search && (
        <div className="explore-feature">
          <DailyQuestion />
          <section className="popular-conversation">
            <h2 className="section-title">
              <Flame />A conversation worth joining
            </h2>
            {posts.length > 0 ? (
              <Link to="/post/$postId" params={{ postId: posts[0].id }}>
                <p className="mt-3 text-sm line-clamp-3">{posts[0].body}</p>
                <small className="mt-2 block text-xs text-muted-foreground">
                  {posts[0].replies.length} replies · #{posts[0].topic.toLowerCase()}
                  <ArrowUpRight className="inline ml-1 size-3.5 text-primary" />
                </small>
              </Link>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No conversations right now. Share a thought to start the dialogue!
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
