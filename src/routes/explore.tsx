import { createFileRoute } from "@tanstack/react-router";
import { Explore } from "@/components/ghostline/explore";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/explore")({
  head: () =>
    pageHead("Explore", "Discover topics and currently available pseudonymous conversations."),
  component: Explore,
});
