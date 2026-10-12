import { createFileRoute } from "@tanstack/react-router";
import { HomeFeed } from "@/components/ghostline/home";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Your feed",
      "Fresh pseudonymous thoughts and text-only conversations, available for 24 hours.",
    ),
  component: HomeFeed,
});
