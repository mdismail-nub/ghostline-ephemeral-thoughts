import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/ghostline/settings";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/settings")({
  head: () =>
    pageHead(
      "Settings & privacy",
      "Choose your appearance, pseudonym, and privacy preferences. Understand post expiration.",
    ),
  component: SettingsPage,
});
