import { Button } from "@goat-format-chatbot/design-system/components/button";
import { cn } from "@goat-format-chatbot/design-system/lib/utils";

import { SUGGESTIONS } from "@/features/chat/api/suggestions";

export function PresetChips({
  onPick,
  wrap = false,
}: {
  onPick: (question: string) => void;
  wrap?: boolean;
}) {
  return (
    <ul
      aria-label="Demo questions"
      className={cn(
        "-my-1 flex gap-2 py-1",
        wrap
          ? "flex-wrap"
          : "overflow-x-auto [scrollbar-width:none] sm:flex-wrap sm:overflow-visible",
      )}
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
