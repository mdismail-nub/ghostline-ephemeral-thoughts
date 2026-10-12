import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/ghostline/settings";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/profile")({
  head: () =>
    pageHead(
      "Your identity",
      "Manage your pseudonymous identity and view current posts and active replies.",
    ),
  component: ProfilePage,
});
