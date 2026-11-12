import type { UIMessage } from "@convex-dev/agent/react";
import { z } from "zod";

export type LookupState = "running" | "done" | "failed";

export type Lookup = { id: string; state: LookupState } & (
  | { tool: "findCard"; name: string }
  | { tool: "read"; card: string }
  | { tool: "search"; query: string; card?: string }
);

export type ChatPart =
  | { kind: "text"; key: string; text: string }
  | { kind: "lookup"; lookup: Lookup };

export type Source = { url: string; title: string; note: string };

export type ChatMessage = {
  key: string;
  role: "user" | "assistant";
  status: "pending" | "streaming" | "done" | "failed";
  sentAt: number;
  text: string;
  parts: ChatPart[];
  sources: Source[];
};

const lookupInput = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("findCard"), input: z.object({ name: z.string() }) }),
  z.object({ tool: z.literal("read"), input: z.object({ card: z.string() }) }),
  z.object({
    tool: z.literal("search"),
    input: z.object({ query: z.string(), card: z.string().optional() }),
  }),
]);

type Part = UIMessage["parts"][number];

function lookupState(state: string): LookupState | undefined {
  if (state === "output-available") return "done";
  if (state === "output-error" || state === "output-denied") return "failed";
  if (state === "input-available") return "running";
  return undefined;
}

function toPart(part: Part, index: number): ChatPart[] {
  if (part.type === "text")
    return part.text ? [{ kind: "text", key: `text-${index}`, text: part.text }] : [];
  return toLookup(part).map((lookup) => ({ kind: "lookup", lookup }));
}

function toLookup(part: Part): Lookup[] {
  if (!part.type.startsWith("tool-") || !("toolCallId" in part) || !("state" in part)) return [];
  const state = lookupState(part.state);
  const parsed = lookupInput.safeParse({
    tool: part.type.slice("tool-".length),
    input: part.input,
  });
  if (!state || !parsed.success) return [];
  const id = part.toolCallId;
  switch (parsed.data.tool) {
    case "findCard":
      return [{ id, state, tool: "findCard", name: parsed.data.input.name }];
    case "read":
      return [{ id, state, tool: "read", card: parsed.data.input.card }];
    case "search":
      return [{ id, state, tool: "search", ...parsed.data.input }];
  }
}

const statuses = {
  pending: "pending",
  streaming: "streaming",
  success: "done",
  failed: "failed",
} as const satisfies Record<UIMessage["status"], ChatMessage["status"]>;

const sourcesHeading = /^[ \t]*(?:#{1,6}[ \t]*)?(?:\*\*|__)?Sources:?(?:\*\*|__)?:?[ \t]*$/im;
const sourceItem = /^\s*[-*]\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\W*(.*)$/;

function toSource(line: string): Source[] {
  const match = sourceItem.exec(line);
  if (!match?.[1] || !match[2]) return [];
  return [{ title: match[1], url: match[2], note: match[3]?.trim() ?? "" }];
}

type Answer = Pick<ChatMessage, "parts" | "sources">;

function splitSources(parts: ChatPart[]): Answer {
  const last = parts.findLastIndex((part) => part.kind === "text");
  const part = parts[last];
  if (part?.kind !== "text") return { parts, sources: [] };
  const heading = sourcesHeading.exec(part.text);
  if (!heading) return { parts, sources: [] };
  const answer = part.text.slice(0, heading.index).trimEnd();
  const sources = part.text
    .slice(heading.index + heading[0].length)
    .split("\n")
    .flatMap(toSource);
  const kept = answer ? [{ ...part, text: answer }] : [];
  return { parts: [...parts.slice(0, last), ...kept, ...parts.slice(last + 1)], sources };
}

export function toChatMessage(message: UIMessage): ChatMessage[] {
  if (message.role !== "user" && message.role !== "assistant") return [];
  const parts = message.parts.flatMap(toPart);
  const { _creationTime: sentAt } = message;
  return [
    {
      key: message.key,
      role: message.role,
      status: statuses[message.status],
      sentAt,
      text: message.text,
      ...(message.role === "assistant" ? splitSources(parts) : { parts, sources: [] }),
    },
  ];
}
