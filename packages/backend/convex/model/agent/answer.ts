import { createThread } from "@convex-dev/agent";

import { components } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import { lastStepAnswers, type RulingsAgent } from "./agent";

export type Answer = { threadId: string; text: string };

export const STREAM_THROTTLE_MS = 100;

export async function streamReply(
  ctx: ActionCtx,
  agent: RulingsAgent,
  { threadId, promptMessageId }: { threadId: string; promptMessageId: string },
  throttleMs = STREAM_THROTTLE_MS,
): Promise<void> {
  const result = await agent.streamText(
    ctx,
    { threadId },
    { promptMessageId, prepareStep: lastStepAnswers },
    { saveStreamDeltas: { chunking: "word", throttleMs } },
  );
  await result.consumeStream();
}

export async function answer(
  ctx: ActionCtx,
  agent: RulingsAgent,
  { question, threadId }: { question: string; threadId?: string },
): Promise<Answer> {
  const thread = threadId ?? (await createThread(ctx, components.agent));
  const result = await agent.generateText(
    ctx,
    { threadId: thread },
    { prompt: question, prepareStep: lastStepAnswers },
  );
  return { threadId: thread, text: result.text };
}
