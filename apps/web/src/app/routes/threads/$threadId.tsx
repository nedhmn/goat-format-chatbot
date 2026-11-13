import { createFileRoute } from "@tanstack/react-router";

import { useThreadTitle } from "@/features/chat/api/chat";
import { ChatThread } from "@/features/chat/components/chat-thread";

const APP_NAME = "Goat Format Chatbot";

function Thread() {
  const { threadId } = Route.useParams();
  const title = useThreadTitle(threadId);
  return (
    <>
      <title>{title ? `${title} · ${APP_NAME}` : APP_NAME}</title>
      <ChatThread key={threadId} threadId={threadId} />
    </>
  );
}

export const Route = createFileRoute("/threads/$threadId")({ component: Thread });
