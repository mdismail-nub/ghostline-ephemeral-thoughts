import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Clock3, MoreHorizontal, Flag, Ban, HandHeart } from "lucide-react";
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
  const { now, react, block, setTopic } = useGhost();
  return (
    <article className="post-card">
      <div className="post-top">
        <div className="flex min-w-0 items-center gap-3">
          <GhostMark className={`avatar ${post.tone}`} />
          <div className="min-w-0">
            <span className="post-alias">{post.alias}</span>
            <p className="post-time">{relativeTime(post.createdAt, now)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="expiry">
            <Clock3 size={12} />
            <span>Expires in {remaining(post.expiresAt, now)}</span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Options for ${post.alias}'s post`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() =>
                  toast.success("Report recorded in this preview; not sent to moderators")
                }
              >
                <Flag />
                Report post
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => block(post.alias)}>
                <Ban />
                Block {post.alias}
              </DropdownMenuItem>
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
        <div className="flex items-center gap-5">
          {post.reactions.map((r) => (
            <Button
              key={r.kind}
              variant="ghost"
              size="sm"
              className={`reaction ${r.selected ? "selected" : ""}`}
              aria-label={`${r.kind === "heart" ? "Like" : "Relate to"} post by ${post.alias}`}
              aria-pressed={r.selected}
              onClick={() => react(post.id, r.kind)}
            >
              {r.kind === "heart" ? (
                <Heart className={r.selected ? "fill-current" : ""} />
              ) : (
                <HandHeart />
              )}
              {r.count}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="reaction" asChild>
            <Link to="/post/$postId" params={{ postId: post.id }}>
              <MessageCircle />
              {post.replies.length}
              <span className="reply-label">Replies</span>
            </Link>
          </Button>
        </div>
        <span className="post-footer-note">Just here for a moment</span>
      </div>
    </article>
  );
}
