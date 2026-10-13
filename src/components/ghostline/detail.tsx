import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Send, Trash2, Clock3, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGhost } from "./store";
import { PostCard } from "./post-card";
import { PageHeading, Rightbar, EmptyState } from "./layout";
import { GhostMark } from "./icons";
import { validBody, relativeTime } from "@/lib/services/mock";

export function PostDetail({ id }: { id: string }) {
  const { posts, now, reply, alias, deleteReply } = useGhost();
  const post = posts.find((p) => p.id === id);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const remainingChars = 280 - body.length;

  return (
    <>
      <main className="feed-column">
        <Button
          asChild
          variant="ghost"
          className="mb-5 px-0 text-muted-foreground hover:text-foreground"
        >
          <Link to="/">
            <ArrowLeft className="size-4 mr-1.5" />
            Back to feed
          </Link>
        </Button>

        {post ? (
          <>
            <PageHeading
              title="Conversation"
              subtitle="A thought and the people it brings together."
            />

            <PostCard post={post} detail />

            <div className="flex items-center justify-between mt-8 mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <MessageCircle className="size-4 text-primary" />
                <span>
                  {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
                </span>
              </h2>

            </div>

            {post.replies.length ? (
              <div className="space-y-3 mb-6">
                {post.replies
                  .slice()
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map((r) => {
                    const isOwner = r.alias === alias;
                    return (
                      <article className="reply-card" key={r.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <GhostMark className="avatar blue shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="post-alias">{r.alias}</h3>
                                {isOwner && <span className="author-badge">You</span>}
                              </div>
                              <span className="post-time">{relativeTime(r.createdAt, now)}</span>
                            </div>
                          </div>
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 shrink-0"
                              onClick={() => deleteReply(post.id, r.id)}
                              title="Delete your reply"
                              aria-label="Delete your reply"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                        <p className="reply-body mt-2.5">{r.body}</p>
                      </article>
                    );
                  })}
              </div>
            ) : (
              <EmptyState
                title="Be the first to reply."
                description="Add your perspective to the conversation."
              />
            )}

            <form
              className="reply-composer-card"
              onSubmit={(e) => {
                e.preventDefault();
                if (reply(post.id, body)) {
                  setBody("");
                  setError("");
                } else {
                  setError("This thought is no longer available or your reply is empty.");
                }
              }}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-3">
                <label htmlFor="reply-input" className="text-sm font-semibold">
                  Reply as <span className="text-primary font-bold">{alias}</span>
                </label>
                <span
                  className={`text-xs tabular-nums ${remainingChars < 20 ? "text-destructive font-semibold" : "text-muted-foreground"}`}
                  aria-live="polite"
                >
                  {remainingChars} left
                </span>
              </div>

              <textarea
                id="reply-input"
                className="reply-textarea"
                placeholder="Share your kind thoughts or perspective…"
                maxLength={280}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
              />

              <div className="reply-composer-actions">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock3 className="size-3 shrink-0" />
                  <span>Replies expire with this post.</span>
                </p>
                <Button type="submit" disabled={!validBody(body)} size="sm">
                  <span>Send reply</span>
                  <Send className="size-3.5 ml-1.5" />
                </Button>
              </div>

              {error && (
                <p role="alert" className="text-destructive text-xs mt-2">
                  {error}
                </p>
              )}
            </form>
          </>
        ) : (
          <EmptyState
            title="This thought has drifted away."
            description="The thought has expired after 24 hours, was deleted by its author, or is no longer available."
          />
        )}
      </main>
      <Rightbar />
    </>
  );
}
