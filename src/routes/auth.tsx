import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/ghostline/auth";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/auth")({
  head: () =>
    pageHead(
      "Sign in",
      "Sign in to Unsaid. Your public identity remains pseudonymous and private.",
    ),
  component: AuthPage,
});
