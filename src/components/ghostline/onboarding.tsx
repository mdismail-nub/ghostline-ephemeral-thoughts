import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGhost } from "./store";
import art from "@/assets/conversation.png";
import fading from "@/assets/fading.png";
import privacy from "@/assets/privacy.png";
const slides = [
  {
    title: "Say what you think.",
    description:
      "A thought doesn’t need a real name. Share yours under a pseudonym, and find people who get it.",
  },
  {
    title: "Conversations that fade.",
    description:
      "Your posts and replies become unavailable after 24 hours. A little less permanence. A little more freedom.",
  },
  {
    title: "Your space, your rules.",
    description:
      "Just text and genuine conversations. Choose your topics, block identities, and report what doesn’t belong.",
  },
];
export function Onboarding() {
  const { onboard, finishOnboarding } = useGhost();
  const [step, setStep] = useState(0);
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
            src={step === 1 ? fading : step === 2 ? privacy : art}
            width={1024}
            height={1024}
            alt={step === 1 ? "A clock beside a fading speech bubble" : step === 2 ? "A mint privacy shield protecting text cards" : "Soft lavender and mint conversation bubbles"}
          />
          <span className="onboard-wordmark">ghostline</span>
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
          <p className="prototype-note">You’re exploring a preview with sample conversations.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
