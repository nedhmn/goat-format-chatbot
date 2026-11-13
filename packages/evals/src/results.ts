import { mkdir, writeFile } from "node:fs/promises";

import type { ExperimentResult } from "@langfuse/client";
import { z } from "zod";

import { answer } from "./ask.ts";
import { expectation, type Expectation } from "./scorers.ts";

const RESULTS = new URL("../results/", import.meta.url);

type Run = { commit: string; judge: string };

function fileName(ranAt: Date) {
  return `${ranAt
    .toISOString()
    .replaceAll(":", "-")
    .replace(/\.\d+Z$/, "Z")}.json`;
}

export async function writeResults(
  result: ExperimentResult<string, Expectation>,
  run: Run,
): Promise<URL> {
  const ranAt = new Date();
  const items = result.itemResults.map((item) => {
    const given = answer.parse(item.output);
    return {
      question: z.string().parse(item.item.input),
      expected: expectation.parse(item.item.expectedOutput),
      answer: given.text,
      cited: given.urls,
      lookups: given.lookups,
      length: given.text.length,
      error: given.error,
      scores: item.evaluations.map(({ name, value, comment }) => ({ name, value, comment })),
      traceId: item.traceId,
    };
  });
  const summary = {
    ranAt: ranAt.toISOString(),
    runName: result.runName,
    experimentUrl: result.experimentUrl,
    ...run,
    passRates: result.runEvaluations.map(({ name, value, comment }) => ({ name, value, comment })),
    items,
  };
  await mkdir(RESULTS, { recursive: true });
  const file = new URL(fileName(ranAt), RESULTS);
  await writeFile(file, `${JSON.stringify(summary, null, 2)}\n`);
  return file;
}
