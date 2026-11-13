import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";

import { api } from "@goat-format-chatbot/backend/convex/_generated/api.js";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";

import { toChatMessage, type ChatMessage } from "../src/features/chat/api/chat-message.ts";
import type { DemoThread } from "../src/features/chat/api/demo-threads.ts";
import { SUGGESTIONS } from "../src/features/chat/api/suggestions.ts";

const OUTPUT = new URL("../src/features/chat/data/demo-threads.json", import.meta.url);
const POLL_MS = 2000;
const TIMEOUT_MS = 3 * 60 * 1000;

const { VITE_CONVEX_URL } = z.object({ VITE_CONVEX_URL: z.url() }).parse(process.env);
const client = new ConvexHttpClient(VITE_CONVEX_URL);

function slug(text: string) {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .trim()
    .replaceAll(" ", "-");
}

async function threadMessages(threadId: string) {
  const { page } = await client.query(api.chat.messages, {
    threadId,
    paginationOpts: { numItems: 100, cursor: null },
  });
  return page.toSorted((a, b) => a.order - b.order).flatMap(toChatMessage);
}

function answered(messages: ChatMessage[]) {
  const last = messages.at(-1);
  if (messages.some((message) => message.status === "failed")) return true;
  return last?.role === "assistant" && last.status === "done" && last.text.length > 0;
}

async function waitForAnswer(threadId: string) {
  const deadline = Date.now() + TIMEOUT_MS;
  let previous: ChatMessage[] = [];
  while (Date.now() < deadline) {
    const messages = await threadMessages(threadId);
    if (answered(messages) && JSON.stringify(messages) === JSON.stringify(previous))
      return messages;
    previous = messages;
    await sleep(POLL_MS);
  }
  throw new Error(`No answer in ${threadId} after ${TIMEOUT_MS / 1000}s`);
}

async function record(question: string): Promise<DemoThread> {
  console.log(`Asking: ${question}`);
  const { threadId } = await client.mutation(api.chat.send, { question });
  try {
    const messages = await waitForAnswer(threadId);
    if (messages.some((message) => message.status === "failed"))
      throw new Error(`The answer to "${question}" failed`);
    const summary = await client.query(api.chat.thread, { threadId });
    return {
      id: slug(question),
      title: summary?.title ?? question,
      activeAt: summary?.activeAt ?? Date.now(),
      messages,
    };
  } finally {
    await client.mutation(api.chat.remove, { threadId });
  }
}

const threads: DemoThread[] = [];
for (const question of SUGGESTIONS) threads.push(await record(question));
await mkdir(new URL(".", OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(threads, null, 2)}\n`);
console.log(`Recorded ${threads.length} threads to ${OUTPUT.pathname}`);
