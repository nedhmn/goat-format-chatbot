# @goat-format-chatbot/evals

Scores the agent's answers to rulings questions, so a change to the agent can show whether answers got better. Each run is a [Langfuse](https://langfuse.com) experiment: the questions go to the local backend, the answers are scored on this machine, and the run is listed under Experiments in your Langfuse project.

## Run

The local backend must be running (`pnpm dev` from the root).

```sh
cp packages/evals/.env.example packages/evals/.env
pnpm --filter @goat-format-chatbot/evals eval
```

| Variable                                     | Value                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `CONVEX_URL`                                 | The local backend, `CONVEX_URL` in `packages/backend/.env.local`                                |
| `OPENROUTER_API_KEY`                         | For the judge. The same key as `packages/backend/.env` works                                    |
| `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` | From the project's settings in Langfuse                                                         |
| `LANGFUSE_BASE_URL`                          | `https://cloud.langfuse.com` (EU) or `https://us.cloud.langfuse.com` (US), the project's region |

A run asks every case once, three at a time, and each case makes one judge call on OpenRouter. The backend's default limits, 10 questions a minute and 200 a day, would fail cases, so raise `QUESTIONS_PER_MINUTE` and `QUESTIONS_PER_DAY` in `packages/backend/.env` first (see the backend README).

## Cases

`cases/rulings.json`, a list of:

| Field      | Meaning                                                                   |
| ---------- | ------------------------------------------------------------------------- |
| `question` | Asked as a new thread                                                     |
| `expected` | The answer the ruling gives, or that the rulings do not settle it         |
| `source`   | The ruling's `sourceUrl` in the data, or `null` when no ruling settles it |
| `origin`   | Where the case came from. `seed`: written from rulings in the data        |

## Scores

| Score                    | How                                                                             |
| ------------------------ | ------------------------------------------------------------------------------- |
| `cites the ruling`       | 1 when the answer links the case's `source`. Skipped when `source` is `null`    |
| `agrees with the ruling` | 1 when an LLM judge on OpenRouter finds the answer's verdict matches `expected` |

Both run in this process, so Langfuse never sees the OpenRouter key. A failed or timed-out answer scores 0. Each run also gets the pass rate of each score.

## Results

Every run writes `results/<time>.json` with the pass rates, the commit, the judge model, and each answer with its scores and lookup count. Commit the ones worth comparing against: Langfuse's free plan keeps runs for 30 days.
