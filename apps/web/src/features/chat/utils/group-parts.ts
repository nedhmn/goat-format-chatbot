import type { ChatPart, Lookup } from "@/features/chat/api/chat-message";

export type PartGroup =
  | { kind: "text"; key: string; text: string }
  | { kind: "lookups"; key: string; lookups: Lookup[] };

export function groupParts(parts: ChatPart[]): PartGroup[] {
  const groups: PartGroup[] = [];
  for (const part of parts) {
    const previous = groups.at(-1);
    if (part.kind === "text") groups.push(part);
    else if (previous?.kind === "lookups") previous.lookups.push(part.lookup);
    else groups.push({ kind: "lookups", key: part.lookup.id, lookups: [part.lookup] });
  }
  return groups;
}
