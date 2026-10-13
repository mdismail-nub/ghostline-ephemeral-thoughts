import { createFileRoute } from "@tanstack/react-router";
import { PostDetail } from "@/components/ghostline/detail";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/post/$postId")({
  head: () => pageHead("Conversation", "A text-only conversation on Unsaid. Your words. No names."),
  component: Conversation,
});
function Conversation() {
  const { postId } = Route.useParams();
  return <PostDetail id={postId} />;
}
