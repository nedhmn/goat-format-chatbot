import { z } from "zod";

export const env = z
  .object({
    CONVEX_URL: z.url(),
    OPENROUTER_API_KEY: z.string().min(1),
    LANGFUSE_PUBLIC_KEY: z.string().min(1),
    LANGFUSE_SECRET_KEY: z.string().min(1),
    LANGFUSE_BASE_URL: z.url(),
  })
  .parse(process.env);
