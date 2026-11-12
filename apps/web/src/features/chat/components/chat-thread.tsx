import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@goat-format-chatbot/design-system/components/ui/message-scroller";
import { useState } from "react";

import { useAsk, useThreadMessages } from "@/features/chat/api/chat";
import { ChatMessage } from "@/features/chat/components/chat-message";
import { QuestionForm } from "@/features/chat/components/question-form";

export function ChatThread({ threadId }: { threadId: string }) {
  const { messages, loading } = useThreadMessages(threadId);
  const ask = useAsk(threadId);
  const [question, setQuestion] = useState("");
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-6">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1" aria-busy={loading}>
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-8 py-6 text-sm">
              {messages.map((message) => (
                <MessageScrollerItem
                  key={message.key}
                  messageId={message.key}
                  scrollAnchor={message.role === "user"}
                >
                  <ChatMessage message={message} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      <QuestionForm
        ask={ask}
        placeholder="Ask a follow-up"
        question={question}
        onQuestionChange={setQuestion}
      />
    </div>
  );
}
