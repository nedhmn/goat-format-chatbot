import { setTimeout as sleep } from "node:timers/promises";

import { api } from "@goat-format-chatbot/backend/convex/_generated/api.js";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

export const answer = z.object({
  text: z.string(),
  urls: z.array(z.string()),
  lookups: z.number(),
  error: z.string().optional(),
});

export type Answer = z.infer<typeof answer>;

const POLL_MS = 2000;
const SEND_EVERY_MS = 6500;
const TIMEOUT_MS = 3 * 60 * 1000;
const URL_PATTERN = /https?:\/\/[^\s)\]>"']+/g;
const SEND_FAILED = "The question could not be sent";

const noAnswer = { text: "", urls: [], lookups: 0 };

const sendFailure = z.object({ message: z.string() });

const message = z.object({
  order: z.number(),
  role: z.string(),
  status: z.enum(["pending", "streaming", "success", "failed"]),
  text: z.string(),
  parts: z.array(z.object({ type: z.string() })),
});

type Message = z.infer<typeof message>;

const page = z.object({ page: z.array(message) });

function citedUrls(text: string): string[] {
  const found = text.match(URL_PATTERN) ?? [];
  return [...new Set(found.map((url) => url.replace(/[.,;:]+$/, "")))];
}

function toAnswer(messages: Message[]): Answer {
  const replies = messages.filter((reply) => reply.role === "assistant");
  const text = replies.at(-1)?.text ?? "";
  const lookups = replies
    .flatMap((reply) => reply.parts)
    .filter((part) => part.type.startsWith("tool-")).length;
  const given = { text, urls: citedUrls(text), lookups };
  if (replies.some((reply) => reply.status === "failed"))
    return { ...given, error: "The answer failed" };
  return given;
}

function settled(messages: Message[]): boolean {
  if (messages.some((reply) => reply.status === "failed")) return true;
  const last = messages.at(-1);
  return last?.role === "assistant" && last.status === "success" && last.text.length > 0;
}

export function asker(convexUrl: string) {
  const client = new ConvexHttpClient(convexUrl);
  let nextSendAt = 0;

  async function waitToSend() {
    const sendAt = Math.max(Date.now(), nextSendAt);
    nextSendAt = sendAt + SEND_EVERY_MS;
    await sleep(sendAt - Date.now());
  }

  async function readMessages(threadId: string): Promise<Message[]> {
    const result = await client.query(api.chat.messages, {
      threadId,
      paginationOpts: { numItems: 100, cursor: null },
    });
    return page.parse(result).page.toSorted((a, b) => a.order - b.order);
  }

  async function waitForAnswer(threadId: string): Promise<Answer> {
    const deadline = Date.now() + TIMEOUT_MS;
    let previous = "";
    while (Date.now() < deadline) {
      const messages = await readMessages(threadId);
      const current = JSON.stringify(messages);
      if (settled(messages) && current === previous) return toAnswer(messages);
      previous = current;
      await sleep(POLL_MS);
    }
    return { ...noAnswer, error: `No answer after ${TIMEOUT_MS / 1000}s` };
  }

  return async function ask(question: string): Promise<Answer> {
    let threadId: string;
    await waitToSend();
    try {
      ({ threadId } = await client.mutation(api.chat.send, { question }));
    } catch (error) {
      const failure = sendFailure.safeParse(error);
      return { ...noAnswer, error: failure.success ? failure.data.message : SEND_FAILED };
    }
    try {
      return await waitForAnswer(threadId);
    } finally {
      await client.mutation(api.chat.remove, { threadId });
    }
  };
}
