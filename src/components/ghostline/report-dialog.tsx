import { useState } from "react";
import { Flag, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useGhost } from "./store";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetAlias: string;
  postId?: string;
  itemType?: "post" | "reply";
}

const REPORT_REASONS = [
  { id: "privacy", label: "Private personal information / Doxxing" },
  { id: "harassment", label: "Harassment, hate, or bullying" },
  { id: "spam", label: "Spam or automated content" },
  { id: "inappropriate", label: "Explicit or inappropriate content" },
  { id: "safety", label: "Safety concern or threats" },
  { id: "other", label: "Other community concern" },
];

export function ReportDialog({
  open,
  onOpenChange,
  targetAlias,
  postId,
  itemType = "post",
}: ReportDialogProps) {
  const { reportPost } = useGhost();
  const [reason, setReason] = useState("privacy");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const selectedObj = REPORT_REASONS.find((r) => r.id === reason);
    const reasonLabel = selectedObj?.label || reason;

    try {
      if (postId && itemType === "post") {
        await reportPost(postId, reasonLabel);
      }
    } finally {
      setSubmitting(false);
      onOpenChange(false);
      setDetails("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-card rounded-2xl p-6 border border-border shadow-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-rose-500 mb-1">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Report {itemType}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Help us protect privacy and community peace. What is concerning about this {itemType} by{" "}
            <span className="font-semibold text-foreground">{targetAlias}</span>?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Privacy moderation policy callout */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Automated Privacy Rule:</strong> If any thought receives{" "}
              <strong>4 or more community reports</strong>, it is immediately deleted from Unsaid
              and a privacy alert is delivered to the creator.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">Reason for report</label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    reason === r.id
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span>{r.label}</span>
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="accent-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="report-notes" className="text-xs font-semibold text-foreground block">
              Additional context (optional)
            </label>
            <textarea
              id="report-notes"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional privacy or safety details..."
              rows={2}
              maxLength={200}
              className="w-full text-xs p-2.5 rounded-xl border border-border bg-input-bg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {submitting ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
