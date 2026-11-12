// Adapted from vercel/ai-elements packages/elements/src/conversation.tsx
// Copyright 2023 Vercel, Inc. Licensed under Apache-2.0. Modified.
import type * as React from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { cn } from "../lib/utils.ts";
import { Button } from "./button.tsx";

function Conversation({ className, ...props }: React.ComponentProps<typeof StickToBottom>) {
  return (
    <StickToBottom
      data-slot="conversation"
      className={cn("relative flex-1 overflow-y-hidden", className)}
      initial="smooth"
      resize="smooth"
      role="log"
      {...props}
    />
  );
}

function ConversationContent({
  className,
  ...props
}: React.ComponentProps<typeof StickToBottom.Content>) {
  return (
    <StickToBottom.Content
      data-slot="conversation-content"
      className={cn("flex flex-col gap-8 py-6", className)}
      {...props}
    />
  );
}

function ConversationScrollButton({
  className,
  children = "Jump to latest",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <Button
      data-slot="conversation-scroll-button"
      variant="outline"
      className={cn("absolute bottom-4 left-1/2 -translate-x-1/2 bg-bg-elevated", className)}
      onClick={() => void scrollToBottom()}
      {...props}
    >
      {children}
    </Button>
  );
}

export { Conversation, ConversationContent, ConversationScrollButton };
