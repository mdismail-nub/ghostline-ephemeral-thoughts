import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGhost } from "./store";
import { PostCard } from "./post-card";
import { PageHeading, Rightbar, EmptyState } from "./layout";
import { GhostMark } from "./icons";
import { validBody, relativeTime } from "@/lib/services/mock";
export function PostDetail({ id }: { id: string }) {
  const { posts, now, reply } = useGhost();
  const post = posts.find((p) => p.id === id);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <main className="feed-column">
        <Button asChild variant="ghost" className="mb-5 px-0 text-muted-foreground">
          <Link to="/">
            <ArrowLeft />
            Back to feed
          </Link>
        </Button>
        {post ? (
          <>
            <PageHeading
              title="A moment, shared."
              subtitle="A conversation doesn’t have to last forever to mean something."
            />
            <PostCard post={post} detail />
            <h2 className="subheading">{post.replies.length} replies</h2>
            {post.replies.length ? (
              post.replies
                .slice()
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((r) => (
                  <article className="reply-card" key={r.id}>
                    <div className="flex items-center gap-3">
                      <GhostMark className="avatar blue" />
                      <div>
                        <h3 className="post-alias">{r.alias}</h3>
                        <span className="post-time">
                          {relativeTime(r.createdAt, now)} · Fades with this post
                        </span>
                      </div>
                    </div>
                    <p>{r.body}</p>
                  </article>
                ))
            ) : (
              <EmptyState
                title="Be the first to reply."
                description="Sometimes a little understanding goes a long way."
              />
            )}
            <form
              className="reply-composer"
              onSubmit={(e) => {
                e.preventDefault();
                if (reply(post.id, body)) {
                  setBody("");
                  setError("");
                } else
                  setError("This conversation is no longer available, or your reply is empty.");
              }}
            >
              <label htmlFor="reply" className="block mb-3 text-sm font-medium">
                Add your thought
              </label>
              <textarea
                id="reply"
                className="text-input"
                placeholder="Keep the conversation going…"
                maxLength={280}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                aria-describedby="reply-policy"
              />
              <div className="flex items-center justify-between mt-3">
                <p id="reply-policy" className="text-xs text-muted-foreground">
                  Replies fade with their parent post.
                </p>
                <Button type="submit" disabled={!validBody(body)}>
                  Reply
                  <ArrowUpRight />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
                {body.length}/280
              </p>
              {error && (
                <p role="alert" className="text-destructive text-xs mt-2">
                  {error}
                </p>
              )}
            </form>
          </>
        ) : (
          <EmptyState
            title="This moment has passed."
            description="The post has expired, was blocked, or isn’t available in this preview. Its content and replies are no longer shown."
          />
        )}
      </main>
      <Rightbar />
    </>
  );
}
