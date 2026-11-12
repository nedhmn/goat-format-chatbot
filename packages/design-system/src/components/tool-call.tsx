import type * as React from "react";

import { cn } from "../lib/utils.ts";
import { Badge } from "./badge.tsx";

type ToolCallState = "running" | "done" | "failed";

const stateBadge = {
  running: { tone: "accent", label: "Running" },
  done: { tone: "neutral", label: "Done" },
  failed: { tone: "error", label: "Failed" },
} as const;

function ToolCall({
  className,
  label,
  state,
  ...props
}: React.ComponentProps<"div"> & { label: string; state: ToolCallState }) {
  const badge = stateBadge[state];
  return (
    <div
      data-slot="tool-call"
      data-state={state}
      className={cn("flex items-center gap-2 font-ui text-xs text-text-muted", className)}
      {...props}
    >
      <span className="min-w-0 truncate">{label}</span>
      <Badge tone={badge.tone}>{badge.label}</Badge>
    </div>
  );
}

export { ToolCall, type ToolCallState };
