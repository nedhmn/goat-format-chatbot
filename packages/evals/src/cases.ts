import { readFile } from "node:fs/promises";

import { z } from "zod";

const rulingCase = z.strictObject({
  question: z.string().min(1),
  expected: z.string().min(1),
  source: z.url().nullable(),
  origin: z.literal("seed"),
});

export type RulingCase = z.infer<typeof rulingCase>;

export async function readCases(file: URL): Promise<RulingCase[]> {
  return z.array(rulingCase).parse(JSON.parse(await readFile(file, "utf8")));
}
