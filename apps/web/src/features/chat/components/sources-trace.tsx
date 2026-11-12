import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@goat-format-chatbot/design-system/components/ui/trace";
import { RiArrowRightUpLine, RiGlobalLine } from "@remixicon/react";

import type { Source } from "@/features/chat/api/chat-message";

export function SourcesTrace({ sources }: { sources: Source[] }) {
  return (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <RiGlobalLine />
            </TraceIcon>
            <TraceTitle>
              Used {sources.length} {sources.length === 1 ? "source" : "sources"}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                <TraceLine>
                  <TraceTitle>
                    {source.title} <span className="sr-only">(opens in a new tab)</span>
                  </TraceTitle>
                  {source.note ? <TraceDescription>{source.note}</TraceDescription> : null}
                  <TraceIcon>
                    <RiArrowRightUpLine />
                  </TraceIcon>
                </TraceLine>
              </a>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
