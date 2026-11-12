import { createFileRoute } from "@tanstack/react-router";

import { ChatThread } from "@/features/chat/components/chat-thread";

function Thread() {
  const { threadId } = Route.useParams();
  return <ChatThread key={threadId} threadId={threadId} />;
}

export const Route = createFileRoute("/threads/$threadId")({ component: Thread });
