import {
  Message,
  MessageContent,
  MessageMarkdown,
} from "@goat-format-chatbot/design-system/components/message";
import { ToolCall } from "@goat-format-chatbot/design-system/components/tool-call";

import type { ChatMessage as ChatMessageData } from "@/features/chat/api/chat-message";
import { lookupLabel } from "@/features/chat/utils/lookup-label";

export const NO_ANSWER = "The answer stopped before it finished. Ask again.";

const THINKING = "Reading the question";

export function ChatMessage({ message }: { message: ChatMessageData }) {
  if (message.role === "user") {
    return (
      <Message from="user">
        <MessageContent>{message.text}</MessageContent>
      </Message>
    );
  }
  const working = message.status === "pending" || message.status === "streaming";
  const last = message.parts.at(-1);
  return (
    <Message from="assistant">
      <MessageContent>
        {message.parts.map((part) =>
          part.kind === "lookup" ? (
            <ToolCall
              key={part.lookup.id}
              label={lookupLabel(part.lookup)}
              state={part.lookup.state}
            />
          ) : (
            <MessageMarkdown key={part.key} streaming={working && part === last}>
              {part.text}
            </MessageMarkdown>
          ),
        )}
        {working && !last ? <p className="text-sm text-text-muted">{THINKING}</p> : null}
        {message.status === "failed" && !message.text ? (
          <p className="text-sm text-error">{NO_ANSWER}</p>
        ) : null}
      </MessageContent>
    </Message>
  );
}
