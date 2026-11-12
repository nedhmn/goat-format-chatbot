import { useNavigate } from "@tanstack/react-router";

import { useAsk } from "@/features/chat/api/chat";
import { QuestionForm } from "@/features/chat/components/question-form";

export function NewChat() {
  const ask = useAsk();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl text-text-primary">Ask about a ruling</h1>
        <p className="text-text-muted">
          Ask how a card or mechanic plays in Goat Format. Answers cite the rulings they come from.
        </p>
      </div>
      <QuestionForm
        ask={ask}
        onSent={(threadId) => navigate({ to: "/threads/$threadId", params: { threadId } })}
      />
    </div>
  );
}
