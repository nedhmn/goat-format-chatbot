import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useAsk, useSuggestions } from "@/features/chat/api/chat";
import { QuestionForm } from "@/features/chat/components/question-form";
import { SUGGESTION_CARD } from "@/features/chat/utils/suggestion-card";

export function NewChat() {
  const ask = useAsk();
  const suggestions = useSuggestions();
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
        {suggestions.map(({ question: example }) => (
          <li key={example} className="flex">
            <button type="button" className={SUGGESTION_CARD} onClick={() => setQuestion(example)}>
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
