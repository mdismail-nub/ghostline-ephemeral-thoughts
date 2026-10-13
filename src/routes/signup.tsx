import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/ghostline/auth";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/signup")({
  head: () =>
    pageHead(
      "Create account",
      "Create your Ghostline account with a private email and pseudonymous public profile.",
    ),
  component: Signup,
});
function Signup() {
  return <AuthPage signup />;
}
