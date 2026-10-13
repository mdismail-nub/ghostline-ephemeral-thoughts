import { Link } from "@tanstack/react-router";
import {
  Heart,
  HeartCrack,
  MessageCircle,
  Clock3,
  MoreHorizontal,
  Flag,
  Ban,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Post } from "@/types/ghostline";
import { useGhost } from "./store";
import { GhostMark } from "./icons";
import { relativeTime, remaining } from "@/lib/services/mock";

export function PostCard({ post, detail = false }: { post: Post; detail?: boolean }) {
  const { now, react, block, setTopic, alias, deletePost } = useGhost();
  const isOwner = post.alias === alias;

  return (
    <article className="post-card">
      <div className="post-top">
        <div className="flex min-w-0 items-center gap-3">
          <GhostMark className={`avatar ${post.tone}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="post-alias">{post.alias}</span>
              {isOwner && <span className="author-badge">You</span>}
            </div>
            <p className="post-time">{relativeTime(post.createdAt, now)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="expiry" title="Disappears strictly after 24 hours">
            <Clock3 size={12} className="shrink-0" />
            <span>Fades in {remaining(post.expiresAt, now)}</span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="options-trigger"
                aria-label={`Options for ${post.alias}'s post`}
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {isOwner ? (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-medium"
                  onSelect={() => deletePost(post.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete thought
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onSelect={() => toast.success("Report received · Moderation reviewed")}
                  >
                    <Flag className="w-4 h-4 mr-2 text-rose-500" />
                    Report thought
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => block(post.alias)}>
                    <Ban className="w-4 h-4 mr-2 text-amber-500" />
                    Block {post.alias}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {detail ? (
        <p className="post-body">{post.body}</p>
      ) : (
        <Link className="post-body post-link" to="/post/$postId" params={{ postId: post.id }}>
          {post.body}
        </Link>
      )}
      <Button
        variant="ghost"
        size="sm"
        className={`post-topic ${post.tone}`}
        onClick={() => setTopic(post.topic)}
      >
        #{post.topic.toLowerCase()}
      </Button>
      <div className="post-footer">
        <div className="flex items-center gap-3 sm:gap-4">
          {post.reactions.map((r) => {
            const isLove = r.kind === "love" || r.kind === "heart";
            return (
              <Button
                key={r.kind}
                variant="ghost"
                size="sm"
                className={`reaction group ${isLove ? "reaction-love" : "reaction-dislike"} ${
                  r.selected ? "selected" : ""
                }`}
                aria-label={`${isLove ? "Love" : "Dislike"} post by ${post.alias}`}
                aria-pressed={r.selected}
                onClick={() => react(post.id, r.kind)}
              >
                {isLove ? (
                  <Heart
                    className={`w-4 h-4 transition-all duration-200 ${
                      r.selected ? "fill-current text-rose-500 scale-110" : ""
                    }`}
                  />
                ) : (
                  <HeartCrack
                    className={`w-4 h-4 transition-all duration-200 ${
                      r.selected ? "fill-current text-slate-500 dark:text-slate-300 scale-110" : ""
                    }`}
                  />
                )}
                <span className="reaction-name font-medium">{isLove ? "Love" : "Dislike"}</span>
                <span className="reaction-count tabular-nums">{r.count}</span>
              </Button>
            );
          })}
          <Button variant="ghost" size="sm" className="reaction group reaction-reply" asChild>
            <Link to="/post/$postId" params={{ postId: post.id }}>
              <MessageCircle className="w-4 h-4" />
              <span className="reaction-count tabular-nums">{post.replies.length}</span>
              <span className="reply-label hidden xs:inline">Replies</span>
            </Link>
          </Button>
        </div>
        <span className="post-24h-badge">24h ephemeral</span>
      </div>
    </article>
  );
}
