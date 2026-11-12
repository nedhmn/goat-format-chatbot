// Adapted from vercel/ai-elements packages/elements/src/prompt-input.tsx
// Copyright 2023 Vercel, Inc. Licensed under Apache-2.0. Modified.
import type * as React from "react";

import { cn } from "../lib/utils.ts";
import { Button } from "./button.tsx";
import { Textarea } from "./input.tsx";

function PromptInput({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      data-slot="prompt-input"
      className={cn(
        "flex items-end gap-2 rounded-lg border border-border bg-bg-elevated p-2 transition-colors focus-within:border-border-bright",
        className,
      )}
      {...props}
    />
  );
}

function submitOnEnter(event: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
  event.preventDefault();
  const form = event.currentTarget.form;
  const submit = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!form || submit?.disabled) return;
  form.requestSubmit();
}

function PromptInputTextarea({
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="prompt-input-textarea"
      rows={1}
      className={cn(
        "field-sizing-content max-h-48 min-h-10 border-0 bg-transparent focus:border-transparent focus:ring-0",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) submitOnEnter(event);
      }}
      {...props}
    />
  );
}

function PromptInputSubmit({ children = "Ask", ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button data-slot="prompt-input-submit" type="submit" {...props}>
      {children}
    </Button>
  );
}

export { PromptInput, PromptInputSubmit, PromptInputTextarea };
