import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@goat-format-chatbot/design-system/components/ui/message-scroller";
import { useState } from "react";

import { useAsk, useThreadMessages, useThreadNote } from "@/features/chat/api/chat";
import { ChatMessage } from "@/features/chat/components/chat-message";
import { QuestionForm } from "@/features/chat/components/question-form";

export function ChatThread({ threadId }: { threadId: string }) {
  const { messages, loading } = useThreadMessages(threadId);
  const ask = useAsk(threadId);
  const note = useThreadNote(threadId);
  const [question, setQuestion] = useState("");
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-6">
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="min-h-0 flex-1" aria-busy={loading}>
          <MessageScrollerViewport>
            <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-8 pt-10 pb-6 text-sm md:pt-16">
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
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {note ? (
          <p className="rounded-xl border border-border px-4 py-3 text-sm text-text-muted">
            {note}
          </p>
        ) : null}
        <QuestionForm
          ask={ask}
          placeholder="Ask a follow-up"
          question={question}
          onQuestionChange={setQuestion}
        />
      </div>
    </div>
  );
}
