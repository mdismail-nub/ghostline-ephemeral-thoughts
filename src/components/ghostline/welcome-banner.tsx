import { useState, useEffect } from "react";
import { Sparkles, X, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGhost } from "./store";
import conversationIcon from "@/assets/conversation.png";
import fadingIcon from "@/assets/fading.png";
import privacyIcon from "@/assets/privacy.png";

export function WelcomeBanner({ onSparkPrompt }: { onSparkPrompt?: () => void }) {
  const { setOnboard, setCompose } = useGhost();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check if user previously dismissed the feed banner
    const isDismissed = localStorage.getItem("ghostline-feed-banner-dismissed") === "yes";
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("ghostline-feed-banner-dismissed", "yes");
    setDismissed(true);
  };

  const handleOpenTour = () => {
    setOnboard(true);
  };

  if (dismissed) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Welcome to Ghostline"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/40 to-muted/80 border border-primary/25 p-4 sm:p-5 mb-5 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {/* Decorative background blur glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-accent/40 rounded-full blur-xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss welcome banner"
        className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
      >
        <X className="size-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Cute Mascot Avatar Emblem */}
        <div className="shrink-0 size-12 rounded-2xl bg-primary/15 border border-primary/25 p-1 flex items-center justify-center shadow-xs overflow-hidden">
          <img
            src={conversationIcon}
            alt="Ghostline thought icon"
            className="size-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/15">
              Welcome to Ghostline
            </span>
            <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
              Safe, playful & cozy
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Say what’s on your mind. Here for 24 hours, then gently gone.
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            No real identities, no pressure for likes, no permanent archive. Share authentic
            thoughts under a cute pseudonym, design aesthetic quote cards, and watch them fade into
            the ether.
          </p>
        </div>
      </div>

      {/* 3 Core Highlight Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-primary/15 text-xs">
        <div className="flex items-center gap-2.5 text-foreground font-medium bg-background/60 backdrop-blur-xs px-3 py-2 rounded-xl border border-border/50">
          <img src={privacyIcon} alt="" className="size-5 object-contain shrink-0" />
          <span>Cute playful pseudonyms</span>
        </div>
        <div className="flex items-center gap-2.5 text-foreground font-medium bg-background/60 backdrop-blur-xs px-3 py-2 rounded-xl border border-border/50">
          <img src={fadingIcon} alt="" className="size-5 object-contain shrink-0" />
          <span>24h ephemeral freedom</span>
        </div>
        <div className="flex items-center gap-2.5 text-foreground font-medium bg-background/60 backdrop-blur-xs px-3 py-2 rounded-xl border border-border/50">
          <img src={conversationIcon} alt="" className="size-5 object-contain shrink-0" />
          <span>Viral aesthetic card exports</span>
        </div>
      </div>

      {/* Action CTA buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              if (onSparkPrompt) {
                onSparkPrompt();
              } else {
                setCompose(true);
              }
            }}
            className="rounded-xl font-bold gap-1.5 shadow-xs"
          >
            <Sparkles className="size-3.5" />
            <span>Spark a Thought</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenTour}
            className="rounded-xl gap-1.5 font-medium bg-background/80 hover:bg-background"
          >
            <HelpCircle className="size-3.5 text-primary" />
            <span>Take 30-sec Tour</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground h-8"
        >
          Dismiss banner
        </Button>
      </div>
    </div>
  );
}
