import { DAY, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { z } from "zod";

import { components } from "../_generated/api";
import { env, type MutationCtx } from "../_generated/server";

const limit = (fallback: number) => z.coerce.number().int().positive().default(fallback);

const limits = z.object({
  QUESTIONS_PER_MINUTE: limit(10),
  QUESTIONS_PER_DAY: limit(200),
});

export function questionLimits() {
  const parsed = limits.parse({
    QUESTIONS_PER_MINUTE: env.QUESTIONS_PER_MINUTE || undefined,
    QUESTIONS_PER_DAY: env.QUESTIONS_PER_DAY || undefined,
  });
  return { perMinute: parsed.QUESTIONS_PER_MINUTE, perDay: parsed.QUESTIONS_PER_DAY };
}

const limiter = new RateLimiter(components.rateLimiter);

export async function questionAllowed(
  ctx: MutationCtx,
  userId: string | undefined,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const { perMinute, perDay } = questionLimits();
  const windows = [
    { name: "questionsPerMinute", rate: perMinute, period: MINUTE },
    { name: "questionsPerDay", rate: perDay, period: DAY },
  ];
  for (const { name, rate, period } of windows) {
    const status = await limiter.limit(ctx, name, {
      key: userId,
      config: { kind: "fixed window", rate, period },
    });
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
