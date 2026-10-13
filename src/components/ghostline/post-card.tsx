import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  Clock3,
  MoreHorizontal,
  Flag,
  Ban,
  Trash2,
  Share2,
  Send,
  Sparkles,
  Pencil,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Post, ReactionKind } from "@/types/ghostline";
import { useGhost } from "./store";
import { CuteAvatar } from "./cute-avatar";
import { relativeTime, remainingDetailed, isExpiringSoon, validBody } from "@/lib/services/mock";
import { ReportDialog } from "./report-dialog";
import { ReplyItem } from "./reply-item";
import { ShareCardModal } from "./share-card-modal";
import { discoveryTopics } from "@/lib/topic-catalog";

interface PostCardProps {
  post: Post;
  detail?: boolean;
}

export function PostCard({ post, detail = false }: PostCardProps) {
  const { now, react, block, setTopic, alias, deletePost, editPost, reply } = useGhost();
  const [inlineOpen, setInlineOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(post.body);
  const [editTopic, setEditTopic] = useState(post.topic);
  const editCharsLeft = 280 - editDraft.length;

  const handleReaction = (kind: ReactionKind) => {
    setAnimatingReaction(kind);
    react(post.id, kind);
    setTimeout(() => {
      setAnimatingReaction((prev) => (prev === kind ? null : prev));
    }, 500);
  };

  const isOwner = post.alias === alias;
  const charsLeft = 280 - replyDraft.length;
  const expiringSoon = isExpiringSoon(post.expiresAt, now);

  const handleSaveEdit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isOwner) {
      toast.error("You can only edit your own thoughts");
      return;
    }
    if (!validBody(editDraft)) {
      toast.error("Thought content must be between 1 and 280 characters");
      return;
    }
    const success = editPost(post.id, editDraft, editTopic);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleShare = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShareModalOpen(true);
  };

  const handleCopyLinkOnly = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => toast.success("Thought link copied to clipboard!"),
        () => toast.info(`Link: ${url}`),
      );
    } else {
      toast.info(`Link: ${url}`);
    }
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingReply || !validBody(replyDraft)) return;
    setSubmittingReply(true);
    setReplyError("");

    try {
      const ok = reply(post.id, replyDraft);
      if (ok) {
        setReplyDraft("");
        setInlineOpen(true);
      } else {
        setReplyError("This thought has expired or your reply is empty.");
      }
    } catch {
      setReplyError("Failed to submit reply. Please try again.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const toggleReply = () => {
    if (detail) {
      // In detail view, focus the bottom reply input
      const input = document.getElementById("reply-input");
      input?.focus();
    } else {
      setInlineOpen((prev) => !prev);
    }
  };

  return (
    <article className="post-card group transition-all duration-200">
      {/* Card Header */}
      <div className="post-top">
        <div className="flex min-w-0 items-center gap-3">
          <CuteAvatar alias={post.alias} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="post-alias">{post.alias}</span>
              {isOwner && <span className="author-badge">You</span>}
            </div>
            <p className="post-time">
              {relativeTime(post.createdAt, now)}
              {post.isEdited && <span className="ml-1 opacity-75 text-[11px]">· edited</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Expiration Indicator (Live Countdown) */}
          <span
            className={`expiry inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium tabular-nums transition-colors ${
              expiringSoon
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold"
                : "bg-muted/60 text-muted-foreground border-border/50"
            }`}
            title="Disappears strictly 24 hours after publication"
          >
            {expiringSoon ? (
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
            ) : (
              <Clock3 className="size-3 text-primary/70 shrink-0" />
            )}
            <span>
              <span className="hidden xs:inline">{expiringSoon ? "Fades in " : "Expires in "}</span>
              {remainingDetailed(post.expiresAt, now)}
            </span>
          </span>

          {/* Contextual Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="options-trigger rounded-lg hover:bg-muted"
                aria-label={`Options for ${post.alias}'s post`}
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-xs">
              <DropdownMenuItem
                onClick={handleShare}
                className="cursor-pointer font-medium text-primary"
              >
                <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
                Share viral card
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLinkOnly} className="cursor-pointer">
                <Share2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                Copy thought link
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {isOwner ? (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer font-medium text-foreground hover:text-primary"
                    onSelect={() => {
                      setEditDraft(post.body);
                      setEditTopic(post.topic);
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-2" />
                    Edit thought
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
                    onSelect={() => deletePost(post.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete thought
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onSelect={() => setReportOpen(true)}
                    className="cursor-pointer text-rose-500 focus:text-rose-600"
                  >
                    <Flag className="w-3.5 h-3.5 mr-2" />
                    Report thought
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => block(post.alias)}
                    className="cursor-pointer text-amber-600 focus:text-amber-700"
                  >
                    <Ban className="w-3.5 h-3.5 mr-2" />
                    Block {post.alias}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Body & Edit Form */}
      {isEditing ? (
        <form
          onSubmit={handleSaveEdit}
          className="my-3 space-y-3 p-3.5 rounded-xl border border-primary/25 bg-muted/30 animate-in fade-in-50 duration-150"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Pencil className="size-3.5 text-primary" />
              <span>Editing thought</span>
            </span>
            <span
              className={`tabular-nums font-medium ${
                editCharsLeft < 20 ? "text-destructive font-bold" : "text-muted-foreground"
              }`}
            >
              {editCharsLeft} left
            </span>
          </div>

          <textarea
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full text-[15px] p-3 rounded-lg border border-border bg-input-bg text-foreground resize-vertical focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
            placeholder="Edit your thought…"
            autoFocus
          />

          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Topic:</span>
              <select
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                className="text-xs py-1 px-2.5 rounded-md border border-border bg-card text-foreground font-medium cursor-pointer"
              >
                {discoveryTopics.map((t) => (
                  <option key={t.name} value={t.name}>
                    #{t.name.toLowerCase()}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditDraft(post.body);
                  setEditTopic(post.topic);
                  setIsEditing(false);
                }}
                className="h-8 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  !validBody(editDraft) ||
                  (editDraft.trim() === post.body && editTopic === post.topic)
                }
                className="h-8 px-3.5 text-xs font-semibold gap-1.5"
              >
                <Check className="size-3.5" />
                <span>Save</span>
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <>
          {detail ? (
            <p className="post-body text-[15px] sm:text-[15.5px] leading-relaxed text-foreground select-text">
              {post.body}
            </p>
          ) : (
            <Link
              className="post-body post-link block text-[15px] sm:text-[15.5px] leading-relaxed text-foreground hover:text-primary-ink transition-colors"
              to="/post/$postId"
              params={{ postId: post.id }}
            >
              {post.body}
            </Link>
          )}

          {/* Topic Tag Pill */}
          {post.topic && (
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-1.5 h-6.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-accent/80 hover:bg-accent text-primary-ink border border-primary/10 transition-colors mb-3"
              onClick={() => setTopic(post.topic)}
            >
              <span>#{post.topic.toLowerCase()}</span>
            </Button>
          )}
        </>
      )}

      {/* Card Footer */}
      <div className="post-footer">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0 overflow-x-auto no-scrollbar">
          {/* Reaction Buttons */}
          {post.reactions.map((r) => {
            const isLove = r.kind === "love" || r.kind === "heart";
            const isAnim = animatingReaction === r.kind;
            return (
              <Button
                key={r.kind}
                variant="ghost"
                size="sm"
                className={`reaction group/btn rounded-lg gap-1.5 px-2.5 h-8.5 transition-all duration-200 active:scale-95 ${
                  isLove
                    ? r.selected
                      ? "reaction-love selected font-semibold"
                      : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10"
                    : r.selected
                      ? "reaction-dislike selected font-semibold"
                      : "text-muted-foreground hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-500/10"
                }`}
                aria-label={`${isLove ? "Love" : "Dislike"} post by ${post.alias}`}
                aria-pressed={r.selected}
                onClick={() => handleReaction(r.kind)}
              >
                {isLove ? (
                  <Heart
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAnim ? "animate-reaction-love-pop" : ""
                    } ${
                      r.selected
                        ? "fill-rose-500 text-rose-500 scale-105"
                        : "text-muted-foreground/80 group-hover/btn:text-rose-600"
                    }`}
                  />
                ) : (
                  <ThumbsDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAnim ? "animate-reaction-dislike-pop" : ""
                    } ${
                      r.selected
                        ? "fill-slate-700 dark:fill-slate-300 text-slate-800 dark:text-slate-200 scale-105"
                        : "text-muted-foreground/80 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-200"
                    }`}
                  />
                )}
                <span className="reaction-name text-xs font-medium hidden sm:inline">
                  {isLove ? "Love" : "Dislike"}
                </span>
                <span className="reaction-count tabular-nums text-xs font-semibold">{r.count}</span>
              </Button>
            );
          })}

          {/* Reply Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`reaction rounded-lg gap-1.5 px-2.5 h-8.5 transition-all duration-200 active:scale-95 ${
              inlineOpen
                ? "bg-accent text-primary-ink font-semibold border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            aria-label={`Replies to ${post.alias}'s post`}
            onClick={toggleReply}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="reaction-count tabular-nums text-xs font-semibold">
              {post.replies.length}
            </span>
            <span className="reply-label text-xs font-medium hidden sm:inline">
              {post.replies.length === 1 ? "Reply" : "Replies"}
            </span>
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            className="reaction rounded-lg gap-1.5 px-2.5 h-8.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 active:scale-95"
            aria-label="Share thought link"
            onClick={handleShare}
            title="Share viral thought card"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Share</span>
          </Button>
        </div>
        <span className="text-[11px] text-muted-foreground/70 font-medium ml-auto hidden xs:inline">
          24h ephemeral
        </span>
      </div>

      {/* Expandable Inline Reply Section (for Feed Mode) */}
      {!detail && inlineOpen && (
        <div className="pt-4 pb-2 border-t border-border/70 mt-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MessageCircle className="size-3.5 text-primary" />
              <span>Conversation ({post.replies.length})</span>
            </h4>
            <Link
              to="/post/$postId"
              params={{ postId: post.id }}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Open thread →
            </Link>
          </div>

          {/* Existing Replies List with Connector Line */}
          {post.replies.length > 0 ? (
            <div className="relative pl-3 space-y-2.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {post.replies
                .slice()
                .sort((a, b) => a.createdAt - b.createdAt)
                .slice(0, 3)
                .map((r) => (
                  <ReplyItem key={r.id} postId={post.id} reply={r} />
                ))}

              {post.replies.length > 3 && (
                <div className="pt-1 pl-2">
                  <Link
                    to="/post/$postId"
                    params={{ postId: post.id }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all {post.replies.length} replies in conversation…
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-muted/30 border border-dashed border-border/80 text-center">
              <Sparkles className="size-4 text-primary/70 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-foreground">
                No replies yet. Be the first to say something!
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                This little conversation is just getting started.
              </p>
            </div>
          )}

          {/* Inline Reply Composer */}
          <form
            onSubmit={handleInlineSubmit}
            className="p-3.5 rounded-2xl bg-muted/20 border border-border/80 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CuteAvatar alias={alias} size="xs" showSparkle={false} />
                <span className="font-semibold text-foreground">
                  Reply as <span className="text-primary">{alias}</span>
                </span>
              </div>
              <span
                className={`text-[11px] tabular-nums font-medium ${
                  charsLeft < 20 ? "text-destructive font-bold" : "text-muted-foreground"
                }`}
              >
                {charsLeft} left
              </span>
            </div>

            <textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder="Share a thoughtful reply (max 280 chars)…"
              maxLength={280}
              rows={2}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-border bg-card text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock3 className="size-3" />
                <span>Replies fade with this thought</span>
              </span>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => setInlineOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!validBody(replyDraft) || submittingReply}
                  className="h-8 text-xs font-semibold rounded-xl gap-1.5"
                >
                  {submittingReply ? (
                    "Sending…"
                  ) : (
                    <>
                      <span>Reply</span>
                      <Send className="size-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {replyError && (
              <p className="text-destructive text-xs font-medium pt-1" role="alert">
                {replyError}
              </p>
            )}
          </form>
        </div>
      )}

      {/* Report Modal */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetAlias={post.alias}
        postId={post.id}
        itemType="post"
      />

      {/* Viral Social Share Card Modal */}
      <ShareCardModal
        post={post}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </article>
  );
}
