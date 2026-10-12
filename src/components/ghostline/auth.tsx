import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "./layout";
import { GhostMark } from "./icons";
export function AuthPage({ signup = false }: { signup?: boolean }) {
  const [message, setMessage] = useState("");
  return (
    <main className="discovery-main">
      <div className="auth-panel">
        <GhostMark className="avatar lavender" />
        <h1>{signup ? "A fresh start. Just for you." : "Welcome back, wanderer."}</h1>
        <p>
          {signup
            ? "Your public identity is a pseudonym. Your email stays private."
            : "Return to the conversations that are still here, for now."}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(
              "Authentication is not connected in this preview. You can explore with your temporary identity instead.",
            );
          }}
        >
          <label htmlFor="email">Private email</label>
          <input
            className="text-input"
            type="email"
            id="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            className="text-input"
            type="password"
            id="password"
            minLength={8}
            autoComplete={signup ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
            required
          />
          <Button type="submit">
            {signup ? "Create account" : "Sign in"}
            <ArrowRight />
          </Button>
          {message && (
            <p role="status" className="auth-disclosure">
              {message}
            </p>
          )}
        </form>
        <Link className="auth-switch" to={signup ? "/auth" : "/signup"}>
          {signup ? "Already have an account? Sign in" : "New here? Create an account"}
        </Link>
        <div className="auth-disclosure">
          <ShieldCheck className="size-4 inline mr-2" />
          Preview only: no credentials are sent or saved. Ghostline does not promise complete
          anonymity to the service.
        </div>
        <Button variant="ghost" className="mt-5" asChild>
          <Link to="/">
            Continue exploring the preview
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </main>
  );
}
