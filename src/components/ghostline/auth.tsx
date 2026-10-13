import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GhostMark } from "./icons";
import { useGhost } from "./store";

export function AuthPage({ signup = false }: { signup?: boolean }) {
  const navigate = useNavigate();
  const { setAlias, alias } = useGhost();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || password.length < 8) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Give user a tailored pseudonym if new or preserve
      if (signup && email.includes("@")) {
        const baseName = email.split("@")[0]?.replace(/[^a-zA-Z0-9]/g, "") || "GhostWanderer";
        const cleanName = baseName.charAt(0).toUpperCase() + baseName.slice(1, 15);
        setAlias(cleanName || alias);
      }
      toast.success(signup ? "Account registered securely!" : "Welcome back! Signed in.");
      navigate({ to: "/" });
    }, 400);
  }

  return (
    <main className="auth-container">
      <div className="auth-panel">
        <div className="auth-header">
          <GhostMark className="avatar lavender size-12 mb-4" />
          <h1>{signup ? "A fresh start. Just for you." : "Welcome back, wanderer."}</h1>
          <p className="auth-subtitle">
            {signup
              ? "Your public identity remains a private pseudonym. Your email stays confidential."
              : "Return to the thoughts and conversations that are here, for now."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              Private email
            </label>
            <div className="relative">
              <input
                className="text-input"
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <div className="relative">
              <input
                className="text-input"
                type="password"
                id="password"
                minLength={8}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2 h-11" disabled={loading}>
            <span>{loading ? "Processing…" : signup ? "Create account" : "Sign in"}</span>
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </form>

        <Link className="auth-switch" to={signup ? "/auth" : "/signup"}>
          {signup ? "Already have an account? Sign in" : "New here? Create an account"}
        </Link>

        <div className="auth-disclosure">
          <ShieldCheck className="size-4 inline mr-2 text-primary shrink-0" />
          <span>
            Your email is securely stored and never visible on your posts or public profile.
          </span>
        </div>

        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Continue as guest
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
