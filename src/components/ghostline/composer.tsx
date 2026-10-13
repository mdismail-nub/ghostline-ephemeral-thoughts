import { useState } from "react";
import { Sparkles, Clock3, Tag, ChevronDown, Shuffle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import { validBody } from "@/lib/services/mock";
import { discoveryTopics } from "@/lib/topic-catalog";
import { CuteAvatar } from "./cute-avatar";
import { getRandomThoughtSpark, type ThoughtSpark } from "@/lib/thought-sparks";

export function Composer({
  expanded = false,
  onDone,
  initialPrompt,
}: {
  expanded?: boolean;
  onDone?: () => void;
  initialPrompt?: string;
}) {
  const { publish, alias } = useGhost();
  const [body, setBody] = useState(initialPrompt || "");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeSpark, setActiveSpark] = useState<ThoughtSpark | null>(null);

  const handleRollSpark = () => {
    const spark = getRandomThoughtSpark();
    setActiveSpark(spark);
  };

  const handleApplySpark = () => {
    if (!activeSpark) return;
    setBody(activeSpark.text);
    // Auto-match topic
    if (activeSpark.category === "Cozy" || activeSpark.category === "Deep") {
      setTopic("Life");
    } else if (activeSpark.category === "Question" || activeSpark.category === "Random") {
      setTopic("Ideas");
    }
  };

  async function submit() {
    if (busy || !validBody(body)) return;
    setBusy(true);
    setError("");
    if (publish(body, topic || "Random")) {
      setBody("");
      setTopic("");
      setActiveSpark(null);
      onDone?.();
    } else {
      setError("Your post wasn’t added. Check the text and try again.");
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
          <CuteAvatar alias={alias} size="sm" showSparkle={false} />
          <div className="min-w-0">
            <span className="composer-user-alias">{alias}</span>
            <span className="composer-sub-alias">Session-only preview</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Spark Generator Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRollSpark}
            className="h-7 px-2.5 rounded-full text-xs font-semibold gap-1.5 text-primary hover:bg-primary/10 transition-colors"
            title="Roll a random inspiring thought prompt"
          >
            <Sparkles className="size-3.5 animate-spin-slow" />
            <span className="hidden xs:inline">Spark an Idea</span>
          </Button>

          <span className="composer-time-pill" title="Your post expires 24 hours after publishing">
            <Clock3 className="size-3 shrink-0" />
            <span>Expires in 24h</span>
          </span>
        </div>
      </div>

      {/* Dynamic Thought Spark Banner */}
      {activeSpark && (
        <div className="mx-3 my-2 p-2.5 rounded-xl bg-accent/60 border border-primary/30 flex items-start gap-2.5 text-xs animate-in fade-in slide-in-from-top-1">
          <span className="text-base select-none shrink-0">{activeSpark.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-bold text-primary-ink text-[11px] uppercase tracking-wider">
                {activeSpark.category} Spark
              </span>
            </div>
            <p className="text-foreground font-medium leading-relaxed italic">
              "{activeSpark.text}"
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleApplySpark}
                className="h-6 px-2 text-[11px] font-bold rounded-lg gap-1"
              >
                <Check className="size-3" />
                <span>Use prompt</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRollSpark}
                className="h-6 px-2 text-[11px] font-medium rounded-lg gap-1 text-muted-foreground hover:text-foreground"
              >
                <Shuffle className="size-3" />
                <span>Another</span>
              </Button>
              <button
                type="button"
                onClick={() => setActiveSpark(null)}
                aria-label="Dismiss spark"
                className="ml-auto text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

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

      {error && (
        <p role="alert" className="text-destructive text-xs mt-3">
          {error}
        </p>
      )}
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
