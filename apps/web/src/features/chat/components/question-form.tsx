import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@goat-format-chatbot/design-system/components/ui/input-group";
import { RiArrowUpLine } from "@remixicon/react";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import { inputPlaceholder, type Ask } from "@/features/chat/api/chat";

export function QuestionForm({
  ask,
  onSent,
  placeholder = "Ask about a Goat Format ruling",
  question,
  onQuestionChange,
}: {
  ask: Ask;
  onSent?: (threadId: string) => void;
  placeholder?: string;
  question: string;
  onQuestionChange: (question: string) => void;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const canSend = !sending && question.trim() !== "";

  async function send() {
    const asked = question.trim();
    if (!canSend) return;
    setSending(true);
    setError(undefined);
    const sent = await ask(asked);
    setSending(false);
    if (!sent.ok) {
      setError(sent.error);
      return;
    }
    onQuestionChange("");
    onSent?.(sent.threadId);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  function sendOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void send();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <InputGroup>
        <InputGroupTextarea
          aria-label="Question"
          placeholder={inputPlaceholder ?? placeholder}
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          onKeyDown={sendOnEnter}
          className="p-3"
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="default"
            className="ml-auto rounded-full"
            disabled={!canSend}
            aria-label="Send"
          >
            <RiArrowUpLine />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
