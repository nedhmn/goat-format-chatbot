import { execFileSync } from "node:child_process";

import { LangfuseClient, type RunEvaluator } from "@langfuse/client";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { z } from "zod";

import { asker } from "./ask.ts";
import { readCases } from "./cases.ts";
import { env } from "./env.ts";
import { writeResults } from "./results.ts";
import {
  AGREES,
  CITES,
  JUDGE_MODEL,
  agreesWithTheRuling,
  citesTheRuling,
  type Expectation,
} from "./scorers.ts";

const CASES = new URL("../cases/rulings.json", import.meta.url);
const MAX_CONCURRENCY = 3;

const spanProcessor = new LangfuseSpanProcessor();
new NodeTracerProvider({ spanProcessors: [spanProcessor] }).register();
const langfuse = new LangfuseClient();

const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
const cases = await readCases(CASES);
const ask = asker(env.CONVEX_URL);

const passRates: RunEvaluator<string, Expectation> = async ({ itemResults }) =>
  [CITES, AGREES].map((name) => {
    const values = itemResults.flatMap((item) =>
      item.evaluations.filter((evaluation) => evaluation.name === name),
    );
    const passed = values.filter((evaluation) => evaluation.value === 1).length;
    return {
      name: `${name} rate`,
      value: values.length ? passed / values.length : 0,
      comment: `${passed} of ${values.length}`,
    };
  });

const result = await langfuse.experiment.run<string, Expectation>({
  name: "Rulings",
  description: "Rulings questions asked against the local backend",
  metadata: { commit, judge: JUDGE_MODEL, cases: cases.length },
  data: cases.map((rulingCase) => ({
    input: rulingCase.question,
    expectedOutput: { answer: rulingCase.expected, source: rulingCase.source },
    metadata: { origin: rulingCase.origin },
  })),
  task: ({ input }) => ask(z.string().parse(input)),
  evaluators: [citesTheRuling, agreesWithTheRuling(env.OPENROUTER_API_KEY)],
  runEvaluators: [passRates],
  maxConcurrency: MAX_CONCURRENCY,
});

console.log(await result.format());
const written = await writeResults(result, { commit, judge: JUDGE_MODEL });
console.log(`Results written to ${written.pathname}`);

await langfuse.shutdown();
await spanProcessor.shutdown();
