import { Button } from "@goat-format-chatbot/design-system/components/button";

import { SUGGESTIONS } from "@/features/chat/api/suggestions";

export function PresetChips({ onPick }: { onPick: (question: string) => void }) {
  return (
    <ul
      aria-label="Demo questions"
      className="-my-1 flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible"
    >
      {SUGGESTIONS.map((question) => (
        <li key={question} className="flex shrink-0">
          <Button
            type="button"
            variant="outline"
            className="max-w-72 sm:max-w-none"
            onClick={() => onPick(question)}
          >
            <span className="truncate">{question}</span>
          </Button>
        </li>
      ))}
    </ul>
  );
}
