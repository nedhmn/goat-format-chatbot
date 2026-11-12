import { Button } from "@goat-format-chatbot/design-system/components/ui/button";
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
    <div className="flex flex-col gap-6 py-16">
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
      <div className="scrollbar-none flex scroll-fade-x gap-2 overflow-x-auto">
        {SUGGESTIONS.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setQuestion(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
