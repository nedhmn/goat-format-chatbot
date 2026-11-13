import { Link } from "@tanstack/react-router";

import { useSuggestions } from "@/features/chat/api/chat";
import { SUGGESTION_CARD } from "@/features/chat/utils/suggestion-card";

const REPO_URL = "https://github.com/nedhmn/goat-format-chatbot#readme";

export function DemoHome() {
  const recorded = useSuggestions().flatMap(({ question, threadId }) =>
    threadId ? [{ question, threadId }] : [],
  );
  return (
    <div className="mx-auto my-auto flex w-full max-w-3xl flex-col gap-8 pt-10 pb-[max(2.5rem,12vh)]">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl text-foreground">Rulings, answered with sources.</h1>
        <p className="text-muted-foreground">
          This demo replays Goat Format answers recorded from the local app. Each one shows the
          cards and rulings the agent looked up, then the answer and the sources it cites.
        </p>
      </div>
      <section aria-labelledby="recorded-answers" className="flex flex-col gap-3">
        <h2 id="recorded-answers" className="text-sm font-medium text-text-muted">
          Recorded answers
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {recorded.map(({ question, threadId }) => (
            <li key={threadId} className="flex">
              <Link
                to="/threads/$threadId"
                params={{ threadId }}
                className={`${SUGGESTION_CARD} flex flex-col justify-between gap-4`}
              >
                <span>{question}</span>
                <span aria-hidden className="text-text-muted">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-sm text-muted-foreground">
        New questions need the local app and its backend.{" "}
        <a href={REPO_URL} className="text-text-primary">
          Setup is in the repository →
        </a>
      </p>
    </div>
  );
}
