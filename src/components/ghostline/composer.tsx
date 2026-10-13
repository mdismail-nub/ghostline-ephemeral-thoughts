import { useState } from "react";
import { Sparkles, Clock3, Tag, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import { validBody } from "@/lib/services/mock";
import { discoveryTopics } from "@/lib/topic-catalog";
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
    await new Promise((r) => setTimeout(r, 200));
    if (publish(body, topic || "Random")) {
      setBody("");
      setTopic("");
      onDone?.();
    }
    setBusy(false);
  }

  const remainingChars = 280 - body.length;

  return (
    <section
      className={`composer-box ${expanded ? "composer-modal-layout" : ""}`}
      aria-label="Create a new thought"
    >
      <div className="composer-header">
        <div className="flex items-center gap-3">
          <GhostMark className="avatar lavender" />
          <div className="min-w-0">
            <span className="composer-user-alias">{alias}</span>
            <span className="composer-sub-alias">Anonymous author</span>
          </div>
        </div>
        <span
          className="composer-time-pill"
          title="Every thought dissolves strictly after 24 hours"
        >
          <Clock3 className="size-3 shrink-0" />
          <span>Dissolves in 24h</span>
        </span>
      </div>

      <div className="composer-input-wrapper">
        <label htmlFor={expanded ? "modal-post-input" : "feed-post-input"} className="sr-only">
          What is on your mind?
        </label>
        <textarea
          id={expanded ? "modal-post-input" : "feed-post-input"}
          className="composer-textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={280}
          placeholder="What's on your mind? Share a quiet thought, confession, or question…"
          rows={expanded ? 5 : 3}
        />
      </div>

      <div className="composer-toolbar">
        <div className="composer-topic-pill">
          <Tag className="size-3.5 text-primary shrink-0" />
          <select
            className="composer-topic-select"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label="Select post topic"
          >
            <option value="">Choose a topic (default: Random)</option>
            {discoveryTopics.map((t) => (
              <option key={t.name} value={t.name}>
                #{t.name.toLowerCase()}
              </option>
            ))}
          </select>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0 pointer-events-none" />
        </div>

        <div className="composer-actions">
          <span
            className={`composer-counter ${remainingChars < 20 ? "text-destructive font-semibold" : ""}`}
            aria-live="polite"
          >
            {remainingChars} left
          </span>
          <Button
            className="composer-submit-btn"
            disabled={!validBody(body) || busy}
            onClick={submit}
          >
            {busy ? (
              <span>Posting…</span>
            ) : (
              <>
                <span>Post thought</span>
                <Sparkles className="size-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="composer-footer-notice">
        <Sparkles className="size-3 text-primary shrink-0" />
        <span>Text only. No permanent footprint. Automatically deleted in 24 hours.</span>
      </div>
    </section>
  );
}

export function ComposeDialog() {
  const { compose, setCompose } = useGhost();
  return (
    <Dialog open={compose} onOpenChange={setCompose}>
      <DialogContent className="compose-dialog-modal">
        <DialogTitle className="text-xl font-bold">Share a moment in the stream</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Say what’s on your mind. Everything dissolves automatically in 24 hours.
        </DialogDescription>
        <div className="mt-4">
          <Composer expanded onDone={() => setCompose(false)} />
        </div>
        <div className="flex justify-end mt-2">
          <Button variant="ghost" size="sm" onClick={() => setCompose(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
