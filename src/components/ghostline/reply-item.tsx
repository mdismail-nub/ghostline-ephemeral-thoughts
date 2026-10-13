import { useState } from "react";
import { Heart, Trash2, MoreHorizontal, Flag, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Reply } from "@/types/ghostline";
import { useGhost } from "./store";
import { CuteAvatar } from "./cute-avatar";
import { relativeTime } from "@/lib/services/mock";
import { ReportDialog } from "./report-dialog";

interface ReplyItemProps {
  postId: string;
  reply: Reply;
}

export function ReplyItem({ postId, reply }: ReplyItemProps) {
  const { now, alias, deleteReply, block, reactReply } = useGhost();
  const [reportOpen, setReportOpen] = useState(false);
  const isOwner = reply.alias === alias;

  return (
    <article className="group relative flex gap-3 p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/60 border border-border/60 transition-all duration-200">
      <CuteAvatar alias={reply.alias} size="sm" showSparkle={false} className="mt-0.5" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-xs text-foreground truncate">{reply.alias}</span>
            {isOwner && (
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-accent text-primary">
                You
              </span>
            )}
            <span className="text-[11px] text-muted-foreground shrink-0">
              {relativeTime(reply.createdAt, now)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reactReply(postId, reply.id)}
              className={`h-7 px-2 text-xs rounded-lg gap-1 transition-colors ${
                reply.liked
                  ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={reply.liked ? "Liked reply" : "Like reply"}
              aria-label={reply.liked ? "Unlike reply" : "Like reply"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  reply.liked ? "fill-current text-rose-500 scale-110" : ""
                }`}
              />
              {(reply.likes ?? 0) > 0 && (
                <span className="text-[11px] tabular-nums font-medium">{reply.likes}</span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                  aria-label="Reply options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                {isOwner ? (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onSelect={() => deleteReply(postId, reply.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete reply
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onSelect={() => setReportOpen(true)}
                      className="cursor-pointer text-rose-500 focus:text-rose-600"
                    >
                      <Flag className="w-3.5 h-3.5 mr-2" />
                      Report reply
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => block(reply.alias)}
                      className="cursor-pointer text-amber-600 focus:text-amber-700"
                    >
                      <Ban className="w-3.5 h-3.5 mr-2" />
                      Block {reply.alias}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap break-words mt-1.5 leading-relaxed">
          {reply.body}
        </p>
      </div>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetAlias={reply.alias}
        itemType="reply"
      />
    </article>
  );
}
