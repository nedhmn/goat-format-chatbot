import agent from "@convex-dev/agent/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    OPENROUTER_API_KEY: v.optional(v.string()),
    QUESTIONS_PER_MINUTE: v.optional(v.string()),
    QUESTIONS_PER_DAY: v.optional(v.string()),
  },
});
app.use(agent);
app.use(rateLimiter);

export default app;
