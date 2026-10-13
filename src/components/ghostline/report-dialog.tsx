import { useState } from "react";
import { Flag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetAlias: string;
  itemType?: "post" | "reply";
}

const REPORT_REASONS = [
  { id: "harassment", label: "Harassment or bullying" },
  { id: "hate", label: "Hate speech or discrimination" },
  { id: "spam", label: "Spam or automated content" },
  { id: "privacy", label: "Private personal information" },
  { id: "inappropriate", label: "Explicit or inappropriate content" },
  { id: "other", label: "Other concern" },
];

export function ReportDialog({
  open,
  onOpenChange,
  targetAlias,
  itemType = "post",
}: ReportDialogProps) {
  const [reason, setReason] = useState("harassment");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      setDetails("");
      toast.success("Report submitted", {
        description: `Thank you for keeping Unsaid cozy and safe.`,
      });
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-card rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-rose-500 mb-1">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Report {itemType}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Help us protect the community. What is concerning about this {itemType} by{" "}
            <span className="font-semibold text-foreground">{targetAlias}</span>?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">Reason for report</label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    reason === r.id
                      ? "border-primary bg-accent/60 text-foreground font-medium"
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
              placeholder="Provide any additional details..."
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
