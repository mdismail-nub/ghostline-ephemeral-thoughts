import { useState } from "react";
import { Sparkles, Clock3, Tag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import { validBody, PRIVACY_NOTICE } from "@/lib/services/mock";
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
  const [error, setError] = useState("");

  async function submit() {
    if (busy || !validBody(body)) return;
    setBusy(true);
    setError("");
    if (publish(body, topic || "Random")) {
      setBody("");
      setTopic("");
      onDone?.();
    } else { setError("Your post wasn’t added. Check the text and try again."); }
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
            <span className="composer-sub-alias">Session-only preview</span>
          </div>
        </div>
        <span
          className="composer-time-pill"
          title="Your post expires 24 hours after publishing"
        >
          <Clock3 className="size-3 shrink-0" />
          <span>Expires in 24h</span>
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
          placeholder="Share a thought, question or small win…"
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
            <option value="">Topic: Random</option>
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
                <span>Publish</span>
                <Sparkles className="size-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {error && <p role="alert" className="text-destructive text-xs mt-3">{error}</p>}
      <div className="composer-footer-notice">
        <Sparkles className="size-3 text-primary shrink-0" />
        <span>{PRIVACY_NOTICE}</span>
      </div>
    </section>
  );
}

export function ComposeDialog() {
  const { compose, setCompose } = useGhost();
  return (
    <Dialog open={compose} onOpenChange={setCompose}>
      <DialogContent className="compose-dialog-modal">
        <DialogTitle className="text-xl font-bold">Write a post</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Saved for this open session only.
        </DialogDescription>
        <div className="mt-4">
          <Composer expanded onDone={() => setCompose(false)} />
        </div>
        <div className="flex justify-end mt-2">
          <Button variant="ghost" size="sm" onClick={() => setCompose(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
