import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@goat-format-chatbot/design-system/components/conversation";

import { useAsk, useThreadMessages } from "@/features/chat/api/chat";
import { ChatMessage } from "@/features/chat/components/chat-message";
import { QuestionForm } from "@/features/chat/components/question-form";

export function ChatThread({ threadId }: { threadId: string }) {
  const { messages, loading } = useThreadMessages(threadId);
  const ask = useAsk(threadId);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-6">
      <Conversation aria-busy={loading}>
        <ConversationContent>
          {messages.map((message) => (
            <ChatMessage key={message.key} message={message} />
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <QuestionForm ask={ask} placeholder="Ask a follow-up" />
    </div>
  );
}
