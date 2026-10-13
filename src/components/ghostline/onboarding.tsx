import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import conversation from "@/assets/conversation.png";
import fading from "@/assets/fading.png";
import privacy from "@/assets/privacy.png";
const slides = [
  {
    title: "Your thoughts, your little corner.",
    description:
      "A thought doesn’t need a real name. Share yours under a cute pseudonym, and find people who get it.",
    icon: conversation,
    alt: "Unsaid conversation and thoughts icon",
  },
  {
    title: "Here today, gone tomorrow.",
    description:
      "Your posts and replies become unavailable after 24 hours. A little less permanence. A little more freedom.",
    icon: fading,
    alt: "Unsaid 24-hour fading and timer icon",
  },
  {
    title: "Meet people, stay mysterious.",
    description:
      "Just text and genuine conversations. Choose your topics and decide who belongs in your space.",
    icon: privacy,
    alt: "Unsaid privacy, pseudonym and safe community icon",
  },
];
export function Onboarding() {
  const { onboard, finishOnboarding } = useGhost();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (onboard) {
      setStep(0);
    }
  }, [onboard]);
  return (
    <Dialog
      open={onboard}
      onOpenChange={(open) => {
        if (!open) finishOnboarding();
      }}
    >
      <DialogContent className="onboarding-dialog">
        <div className={`onboard-art onboard-step-${step}`}>
          <img
            src={slides[step]?.icon ?? conversation}
            width={1024}
            height={1024}
            alt={slides[step]?.alt ?? "Unsaid"}
            className="onboard-icon-pack-img"
          />
          <span className="onboard-wordmark">unsaid</span>
        </div>
        <div className="onboard-copy">
          <p className="eyebrow">A little less noise. A little more you.</p>
          <DialogTitle>{slides[step]?.title}</DialogTitle>
          <DialogDescription>{slides[step]?.description}</DialogDescription>
          <div className="onboard-progress" aria-label="Onboarding progress">
            {slides.map((_, i) => (
              <Button
                variant="ghost"
                key={i}
                className={`progress-dot ${step === i ? "active" : ""}`}
                onClick={() => setStep(i)}
                aria-label={`Step ${i + 1} of 3`}
                aria-current={step === i ? "step" : undefined}
              />
            ))}
          </div>
          <Button
            className="onboard-next"
            size="lg"
            onClick={() => (step === 2 ? finishOnboarding() : setStep(step + 1))}
          >
            {step === 2 ? "Get started" : "Next"}
            <ArrowRight />
          </Button>
          <div className="flex items-center justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </Button>
            <Button variant="ghost" onClick={finishOnboarding}>
              Skip for now
            </Button>
          </div>
          <p className="prototype-note">
            Session-only preview. No account or permanent storage is connected.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
