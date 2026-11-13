import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { suggestionsSend, useAsk } from "@/features/chat/api/chat";
import { SUGGESTIONS } from "@/features/chat/api/suggestions";
import { PresetChips } from "@/features/chat/components/preset-chips";
import { QuestionForm } from "@/features/chat/components/question-form";

const SUGGESTION_CARD =
  "flex-1 rounded-2xl border border-border p-4 text-left text-sm text-text-secondary transition-colors outline-none hover:bg-bg-hover hover:text-text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

export function NewChat() {
  const ask = useAsk();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  function openThread(threadId: string) {
    void navigate({ to: "/threads/$threadId", params: { threadId } });
  }

  async function send(example: string) {
    const sent = await ask(example);
    if (sent.ok) openThread(sent.threadId);
  }

  return (
    <div className="mx-auto my-auto flex w-full max-w-3xl flex-col gap-6 pt-10 pb-[max(2.5rem,12vh)]">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl text-foreground">Ask about a ruling</h1>
        <p className="text-muted-foreground">
          Ask how a card or mechanic plays in Goat Format. Answers cite the rulings they come from.
        </p>
      </div>
      {suggestionsSend ? <PresetChips onPick={(example) => void send(example)} /> : null}
      <QuestionForm
        ask={ask}
        question={question}
        onQuestionChange={setQuestion}
        onSent={openThread}
      />
      {suggestionsSend ? null : (
        <ul className="grid gap-3 sm:grid-cols-3">
          {SUGGESTIONS.map((example) => (
            <li key={example} className="flex">
              <button
                type="button"
                className={SUGGESTION_CARD}
                onClick={() => setQuestion(example)}
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
