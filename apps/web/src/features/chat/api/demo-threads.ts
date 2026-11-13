import { z } from "zod";

import recorded from "@/features/chat/data/demo-threads.json";

import type { ChatMessage, ChatPart, Lookup, Source } from "./chat-message";

const lookup: z.ZodType<Lookup> = z.intersection(
  z.object({ id: z.string(), state: z.enum(["running", "done", "failed"]) }),
  z.discriminatedUnion("tool", [
    z.object({ tool: z.literal("findCard"), name: z.string() }),
    z.object({ tool: z.literal("read"), card: z.string() }),
    z.object({ tool: z.literal("search"), query: z.string(), card: z.string().optional() }),
  ]),
);

const part: z.ZodType<ChatPart> = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), key: z.string(), text: z.string() }),
  z.object({ kind: z.literal("lookup"), lookup }),
]);

const source: z.ZodType<Source> = z.object({ url: z.url(), title: z.string(), note: z.string() });

const message: z.ZodType<ChatMessage> = z.object({
  key: z.string(),
  role: z.enum(["user", "assistant"]),
  status: z.enum(["pending", "streaming", "done", "failed"]),
  sentAt: z.number(),
  text: z.string(),
  parts: z.array(part),
  sources: z.array(source),
});

const demoThread = z.object({
  id: z.string(),
  title: z.string(),
  activeAt: z.number(),
  messages: z.array(message),
});

export type DemoThread = z.infer<typeof demoThread>;

let parsed: DemoThread[] | undefined;

export function demoThreads(): DemoThread[] {
  parsed ??= z.array(demoThread).parse(recorded);
  return parsed;
}

export function findDemoThread(id: string): DemoThread | undefined {
  return demoThreads().find((thread) => thread.id === id);
}

function normalize(question: string): string {
  return question.trim().toLowerCase();
}

export function findPreset(question: string): DemoThread | undefined {
  const wanted = normalize(question);
  return demoThreads().find((thread) => normalize(thread.messages[0]?.text ?? "") === wanted);
}
