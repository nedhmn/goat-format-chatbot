import type { Evaluation, Evaluator } from "@langfuse/client";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";

import { answer } from "./ask.ts";

export const JUDGE_MODEL = "anthropic/claude-sonnet-5.5";

export const CITES = "cites the ruling";
export const AGREES = "agrees with the ruling";

export const expectation = z.object({ answer: z.string(), source: z.url().nullable() });

export type Expectation = z.infer<typeof expectation>;

const verdict = z.object({
  agrees: z.boolean(),
  reason: z.string(),
});

const JUDGE_INSTRUCTIONS = `You grade answers to Yu-Gi-Oh! Goat Format rulings questions.
You get the question, the reference answer taken from an official ruling, and the answer under test.
The answer agrees when its verdict matches the reference and nothing it says contradicts the reference.
Extra detail is fine. Hedging is fine when it still lands on the reference's verdict.
When the reference says the rulings do not settle the question, the answer agrees only if it says so too instead of giving a confident verdict.
Give the reason in one sentence.`;

export const citesTheRuling: Evaluator<string, Expectation> = async ({
  output,
  expectedOutput,
}) => {
  const expected = expectation.parse(expectedOutput);
  if (expected.source === null) return [];
  const cited = answer.parse(output).urls.includes(expected.source);
  return {
    name: CITES,
    value: cited ? 1 : 0,
    comment: cited ? expected.source : `Missing ${expected.source}`,
  };
};

export function agreesWithTheRuling(apiKey: string): Evaluator<string, Expectation> {
  const model = createOpenRouter({ apiKey }).chat(JUDGE_MODEL);
  return async ({ input, output, expectedOutput }): Promise<Evaluation> => {
    const expected = expectation.parse(expectedOutput);
    const given = answer.parse(output);
    if (given.error) return { name: AGREES, value: 0, comment: given.error };
    const { output: judged } = await generateText({
      model,
      system: JUDGE_INSTRUCTIONS,
      prompt: `Question:\n${input}\n\nReference answer:\n${expected.answer}\n\nAnswer under test:\n${given.text}`,
      output: Output.object({ schema: verdict }),
    });
    return { name: AGREES, value: judged.agrees ? 1 : 0, comment: judged.reason };
  };
}
