import { DAY, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";

export const QUESTIONS_PER_MINUTE = 10;

export const QUESTIONS_PER_DAY = 200;

const limiter = new RateLimiter(components.rateLimiter, {
  questionsPerMinute: { kind: "fixed window", rate: QUESTIONS_PER_MINUTE, period: MINUTE },
  questionsPerDay: { kind: "fixed window", rate: QUESTIONS_PER_DAY, period: DAY },
});

export async function questionAllowed(
  ctx: MutationCtx,
  userId: string | undefined,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  for (const name of ["questionsPerMinute", "questionsPerDay"] as const) {
    const status = await limiter.limit(ctx, name, { key: userId });
    if (!status.ok) return { ok: false, retryAfter: status.retryAfter };
  }
  return { ok: true };
}

export function tooManyQuestions(retryAfter: number): string {
  const seconds = Math.ceil(retryAfter / 1000);
  const wait =
    seconds < 60
      ? plural(seconds, "second")
      : seconds < 3600
        ? plural(Math.ceil(seconds / 60), "minute")
        : plural(Math.ceil(seconds / 3600), "hour");
  return `Too many questions. Try again in ${wait}.`;
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}
