import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@goat-format-chatbot/design-system/components/ui/trace";
import { RiBookOpenLine, RiSearchLine, RiStackLine } from "@remixicon/react";

import type { Lookup } from "@/features/chat/api/chat-message";
import { lookupLabel } from "@/features/chat/utils/lookup-label";

const icons = {
  findCard: RiStackLine,
  read: RiBookOpenLine,
  search: RiSearchLine,
} as const;

const statuses = { running: "running", failed: "error", done: undefined } as const;

function LookupLine({ lookup }: { lookup: Lookup }) {
  const Icon = icons[lookup.tool];
  return (
    <TraceLine status={statuses[lookup.state]}>
      <TraceIcon>
        <Icon />
      </TraceIcon>
      <TraceTitle>{lookupLabel(lookup)}</TraceTitle>
    </TraceLine>
  );
}

export function LookupTrace({ lookups }: { lookups: Lookup[] }) {
  const current = lookups.at(-1);
  if (!current) return null;
  if (lookups.length === 1) {
    return (
      <Trace>
        <LookupLine lookup={current} />
      </Trace>
    );
  }
  const earlier = lookups.slice(0, -1);
  return (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <RiSearchLine />
            </TraceIcon>
            <TraceTitle>
              {earlier.length} earlier {earlier.length === 1 ? "lookup" : "lookups"}
            </TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {earlier.map((lookup) => (
              <LookupLine key={lookup.id} lookup={lookup} />
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <LookupLine lookup={current} />
    </Trace>
  );
}
