import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Send, Clock3, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGhost } from "./store";
import { PostCard } from "./post-card";
import { PageHeading, Rightbar, EmptyState } from "./layout";
import { CuteAvatar } from "./cute-avatar";
import { ReplyItem } from "./reply-item";
import { validBody } from "@/lib/services/mock";

export function PostDetail({ id }: { id: string }) {
  const { posts, reply, alias } = useGhost();
  const post = posts.find((p) => p.id === id);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const remainingChars = 280 - body.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !post || !validBody(body)) return;
    setSubmitting(true);
    setError("");

    try {
      const ok = reply(post.id, body);
      if (ok) {
        setBody("");
      } else {
        setError("This thought is no longer active or your reply was empty.");
      }
    } catch {
      setError("Unable to post your reply. Your draft has been preserved.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="feed-column">
        <Button
          asChild
          variant="ghost"
          className="mb-5 px-0 text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <Link to="/">
            <ArrowLeft className="size-4" />
            <span>Back to feed</span>
          </Link>
        </Button>

        {post ? (
          <>
            <PageHeading
              title="Conversation"
              subtitle="A thoughtful spark and the cozy discussion around it."
            />

            {/* Parent Post */}
            <PostCard post={post} detail />

            {/* Replies Header */}
            <div className="flex items-center justify-between mt-8 mb-4">
              <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="size-4 text-primary" />
                <span>
                  {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
                </span>
              </h2>
              <span className="text-xs text-muted-foreground">Chronological order</span>
            </div>

            {/* Replies List with subtle connector line */}
            {post.replies.length ? (
              <div className="relative pl-3.5 space-y-3 mb-8 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                {post.replies
                  .slice()
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map((r) => (
                    <ReplyItem key={r.id} postId={post.id} reply={r} />
                  ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-muted/20 border border-dashed border-border/80 text-center mb-8">
                <Sparkles className="size-6 text-primary/70 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-foreground">
                  No replies yet. Be the first to say something!
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  This little conversation is just getting started. Share a thoughtful, cozy
                  response.
                </p>
              </div>
            )}

            {/* Complete Reply Composer Card */}
            <form
              className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3"
              onSubmit={handleSubmit}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CuteAvatar alias={alias} size="sm" showSparkle={false} />
                  <label
                    htmlFor="reply-input"
                    className="text-xs sm:text-sm font-bold text-foreground"
                  >
                    Reply as <span className="text-primary font-bold">{alias}</span>
                  </label>
                </div>
                <span
                  className={`text-xs tabular-nums font-semibold ${
                    remainingChars < 20 ? "text-destructive" : "text-muted-foreground"
                  }`}
                  aria-live="polite"
                >
                  {remainingChars} left
                </span>
              </div>

              <textarea
                id="reply-input"
                className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-border bg-input-bg text-foreground resize-vertical focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 leading-relaxed min-h-[90px]"
                placeholder="Share your kind thoughts or perspective (max 280 characters)…"
                maxLength={280}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
              />

              <div className="flex items-center justify-between pt-1 gap-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock3 className="size-3.5 shrink-0 text-primary/70" />
                  <span>Replies disappear automatically with this post.</span>
                </p>
                <Button
                  type="submit"
                  disabled={!validBody(body) || submitting}
                  size="sm"
                  className="rounded-xl px-4 font-semibold gap-1.5"
                >
                  {submitting ? (
                    "Sending…"
                  ) : (
                    <>
                      <span>Submit reply</span>
                      <Send className="size-3.5" />
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <p role="alert" className="text-destructive text-xs font-medium pt-1">
                  {error}
                </p>
              )}
            </form>
          </>
        ) : (
          <EmptyState
            title="This thought has drifted away."
            description="The thought has expired after its 24-hour lifetime, was deleted by its author, or is no longer available."
          />
        )}
      </main>
      <Rightbar />
    </>
  );
}
