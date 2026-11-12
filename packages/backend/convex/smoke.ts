import { env, internalAction } from "./_generated/server";
import { openRouterModel, rulingsAgent } from "./agent/agent";
import { answer } from "./chat";

const questions = [
  "Can Book of Moon be activated during the damage step?",
  "Can Ring of Destruction be chained to 3-Hump Lacooda's effect?",
  "When Mind Crush resolves and my opponent discards nothing, can I look at their hand to check?",
  "Is sinister serpant limited, and what does it do?",
  "Can BLS be special summoned from the graveyard?",
];

export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<{ question: string; answer: string }[]> => {
    const agent = rulingsAgent(openRouterModel(env.OPENROUTER_API_KEY));
    const answers = await Promise.allSettled(
      questions.map((question) => answer(ctx, agent, { question })),
    );
    return answers.map((settled, i) => ({
      question: questions[i] ?? "",
      answer:
        settled.status === "fulfilled" ? settled.value.text : `failed: ${String(settled.reason)}`,
    }));
  },
});
