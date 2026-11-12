import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@goat-format-chatbot/design-system/components/prompt-input";
import { useState, type FormEvent } from "react";

import { chatAvailable, DEMO_NOTICE, type Ask } from "@/features/chat/api/chat";

export function QuestionForm({
  ask,
  onSent,
  placeholder = "Ask about a Goat Format ruling",
}: {
  ask: Ask;
  onSent?: (threadId: string) => void;
  placeholder?: string;
}) {
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const asked = question.trim();
    if (!asked) return;
    setSending(true);
    setError(undefined);
    const sent = await ask(asked);
    setSending(false);
    if (!sent.ok) {
      setError(sent.error);
      return;
    }
    setQuestion("");
    onSent?.(sent.threadId);
  }

  const notice = error ?? (chatAvailable ? undefined : DEMO_NOTICE);

  return (
    <div className="flex flex-col gap-2">
      <PromptInput onSubmit={submit}>
        <PromptInputTextarea
          aria-label="Question"
          placeholder={placeholder}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={!chatAvailable}
        />
        <PromptInputSubmit disabled={!chatAvailable || sending || !question.trim()} />
      </PromptInput>
      {notice ? (
        <p
          role={error ? "alert" : undefined}
          className={error ? "text-sm text-error" : "text-sm text-text-muted"}
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}
