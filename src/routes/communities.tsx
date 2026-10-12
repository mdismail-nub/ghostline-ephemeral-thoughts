import { createFileRoute } from "@tanstack/react-router";
import { Explore } from "@/components/ghostline/explore";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/communities")({
  head: () =>
    pageHead("Communities", "Find shared interests and join temporary text-only discussions."),
  component: Communities,
});
function Communities() {
  return <Explore communities />;
}
