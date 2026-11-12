import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useAsk } from "@/features/chat/api/chat";
import { QuestionForm } from "@/features/chat/components/question-form";

const SUGGESTIONS = [
  "Can Book of Moon be activated during the Damage Step?",
  "Does Sangan trigger if it is banished from the field?",
  "Can Sinister Serpent be targeted in the graveyard during the Standby Phase?",
];

export function NewChat() {
  const ask = useAsk();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  return (
    <div className="mx-auto my-auto flex w-full max-w-3xl flex-col gap-6 pt-10 pb-[max(2.5rem,12vh)]">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl text-foreground">Ask about a ruling</h1>
        <p className="text-muted-foreground">
          Ask how a card or mechanic plays in Goat Format. Answers cite the rulings they come from.
        </p>
      </div>
      <QuestionForm
        ask={ask}
        question={question}
        onQuestionChange={setQuestion}
        onSent={(threadId) => navigate({ to: "/threads/$threadId", params: { threadId } })}
      />
      <ul className="grid gap-3 sm:grid-cols-3">
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion} className="flex">
            <button
              type="button"
              className="flex-1 rounded-2xl border border-border p-4 text-left text-sm text-text-secondary transition-colors outline-none hover:bg-bg-hover hover:text-text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              onClick={() => setQuestion(suggestion)}
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
