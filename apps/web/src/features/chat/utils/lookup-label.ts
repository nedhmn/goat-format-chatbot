import type { Lookup } from "@/features/chat/api/chat-message";

export function lookupLabel(lookup: Lookup): string {
  const running = lookup.state === "running";
  switch (lookup.tool) {
    case "findCard":
      return `${running ? "Looking up" : "Looked up"} ${lookup.name}`;
    case "read":
      return `${running ? "Reading" : "Read"} rulings for ${lookup.card}`;
    case "search": {
      const scope = lookup.card ? ` in ${lookup.card}` : "";
      return `${running ? "Searching" : "Searched"} rulings for "${lookup.query}"${scope}`;
    }
  }
}
