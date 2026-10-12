import { useState } from "react";
import { ArrowUpRight, Clock3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import { topics, validBody } from "@/lib/services/mock";
import { GhostMark } from "./icons";
export function Composer({
  expanded = false,
  onDone,
}: {
  expanded?: boolean;
  onDone?: () => void;
}) {
  const { publish, alias } = useGhost();
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!validBody(body)) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 250));
    if (publish(body, topic || "Random")) {
      setBody("");
      onDone?.();
    }
    setBusy(false);
  }
  return (
    <section
      className={`composer ${expanded ? "composer-expanded" : ""}`}
      aria-label="Create a text post"
    >
      <div className="composer-writing">
        <GhostMark className="avatar lavender" />
        <div className="min-w-0 flex-1">
          <label htmlFor={expanded ? "modal-post" : "feed-post"} className="sr-only">
            Your thought
          </label>
          <textarea
            id={expanded ? "modal-post" : "feed-post"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={280}
            placeholder="What’s on your mind?"
            rows={expanded ? 6 : 2}
          />
          {expanded && (
            <p className="text-xs text-muted-foreground">Posting as {alias} · Preview only</p>
          )}
        </div>
      </div>
      <div className="composer-bottom">
        <label className="topic-select">
          <span className="sr-only">Post topic</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">Add a topic</option>
            {topics.map((t) => (
              <option key={t.name}>{t.name}</option>
            ))}
          </select>
          <ChevronDown size={13} />
        </label>
        <div className="flex items-center gap-4">
          <span
            className={`character-count ${body.length === 280 ? "text-primary" : ""}`}
            aria-live="polite"
          >
            {body.length}/280
          </span>
          <Button disabled={!validBody(body) || busy} onClick={submit}>
            {busy ? "Posting…" : "Post thought"}
            <ArrowUpRight />
          </Button>
        </div>
      </div>
      <div className="composer-note">
        <Clock3 size={13} />
        <span>A little moment. Gone in 24 hours.</span>
      </div>
    </section>
  );
}
export function ComposeDialog() {
  const { compose, setCompose } = useGhost();
  return (
    <Dialog open={compose} onOpenChange={setCompose}>
      <DialogContent className="compose-dialog">
        <DialogTitle>Leave a thought, not a footprint.</DialogTitle>
        <DialogDescription>
          Text only. Up to 280 characters. Available for 24 hours in this preview.
        </DialogDescription>
        <Composer expanded onDone={() => setCompose(false)} />
        <Button variant="ghost" onClick={() => setCompose(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
