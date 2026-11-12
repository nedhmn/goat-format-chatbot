// Adapted from vercel/ai-elements packages/elements/src/message.tsx
// Copyright 2023 Vercel, Inc. Licensed under Apache-2.0. Modified.
import { memo } from "react";
import type * as React from "react";
import Markdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import remend from "remend";

import { cn } from "../lib/utils.ts";

type MessageRole = "user" | "assistant";

function Message({
  className,
  from,
  ...props
}: React.ComponentProps<"div"> & { from: MessageRole }) {
  return (
    <div
      data-slot="message"
      data-from={from}
      className={cn(
        "group flex w-full flex-col gap-2",
        from === "user" ? "ml-auto max-w-[85%] items-end" : "max-w-full",
        className,
      )}
      {...props}
    />
  );
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex w-fit max-w-full min-w-0 flex-col gap-2 font-ui text-sm text-text-primary",
        "group-data-[from=user]:rounded-lg group-data-[from=user]:bg-bg-hover group-data-[from=user]:px-4 group-data-[from=user]:py-3",
        className,
      )}
      {...props}
    />
  );
}

function ExternalLink({ node: _node, ...props }: React.ComponentProps<"a"> & ExtraProps) {
  return <a {...props} target="_blank" rel="noreferrer" />;
}

const MessageMarkdown = memo(function MessageMarkdown({
  children,
  streaming = false,
  className,
}: {
  children: string;
  streaming?: boolean;
  className?: string;
}) {
  return (
    <div data-slot="message-markdown" className={cn("prose", className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={{ a: ExternalLink }}>
        {streaming ? remend(children) : children}
      </Markdown>
    </div>
  );
});

export { Message, MessageContent, MessageMarkdown, type MessageRole };
