import { ShieldAlert, Trash2, CheckCircle2, Bell } from "lucide-react";
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
import { relativeTime } from "@/lib/services/mock";

interface CreatorAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatorAlertDialog({ open, onOpenChange }: CreatorAlertDialogProps) {
  const { alerts, unreadAlertCount, dismissAlert, activeAlertModal, setActiveAlertModal } =
    useGhost();

  // If there's an active modal specifically focused, show it first or show list
  const focusedAlert = activeAlertModal || alerts[0];

  const handleDismissAll = () => {
    alerts.forEach((a) => dismissAlert(a.id));
    setActiveAlertModal(null);
    onOpenChange(false);
  };

  const handleAcknowledge = (id: string) => {
    dismissAlert(id);
    if (activeAlertModal?.id === id) {
      setActiveAlertModal(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full bg-card rounded-2xl p-6 border border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-rose-500 mb-1">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Privacy & Moderation Alert
              </DialogTitle>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Automatic 4-Report Deletion Policy
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            To ensure Unsaid remains a safe, comfortable, and private corner of the internet, any
            thought that receives <strong>4 community reports</strong> is immediately and
            automatically removed.
          </DialogDescription>
        </DialogHeader>

        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
            <p>You have no privacy alerts. All your thoughts are in good standing!</p>
          </div>
        ) : (
          <div className="space-y-3 my-2 max-h-[60vh] overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-colors ${
                  !alert.read ? "bg-rose-500/5 border-rose-500/30" : "bg-muted/40 border-border"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Post Automatically Deleted
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {relativeTime(alert.createdAt, Date.now())}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-card/80 border border-border/60 text-xs italic text-foreground mb-2">
                  &ldquo;{alert.postSnippet}&rdquo;
                </div>

                <div className="text-[11px] text-muted-foreground leading-normal mb-2.5">
                  <strong>Trigger:</strong> {alert.reason || "Received 4 community reports"}. The
                  post has been permanently removed from all feeds.
                </div>

                {!alert.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="w-full text-xs h-8 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    Acknowledge & dismiss
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-end pt-2">
          {alerts.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={handleDismissAll}>
              Clear all
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
