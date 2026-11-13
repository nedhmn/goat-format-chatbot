import type { ChatMessage, ChatPart } from "./chat-message";
import type { DemoTurn, StoredThread } from "./demo-store";
import { findDemoThread } from "./demo-threads";

const THINKING_MS = 700;
const LOOKUPS_MS = 3500;
const LOOKUP_MAX_MS = 600;
const TEXT_MS = 3500;
const TEXT_MAX_MS_PER_CHAR = 4;

type Step = { part: ChatPart; startsAt: number; endsAt: number };

type Schedule = { steps: Step[]; endsAt: number };

function textLength(part: ChatPart): number {
  return part.kind === "text" ? part.text.length : 0;
}

function schedule(answer: ChatMessage): Schedule {
  const lookups = answer.parts.filter((part) => part.kind === "lookup").length;
  const chars = answer.parts.reduce((total, part) => total + textLength(part), 0);
  const lookupMs = lookups ? Math.min(LOOKUP_MAX_MS, LOOKUPS_MS / lookups) : 0;
  const msPerChar = chars ? Math.min(TEXT_MAX_MS_PER_CHAR, TEXT_MS / chars) : 0;
  const steps: Step[] = [];
  let at = THINKING_MS;
  for (const part of answer.parts) {
    const ms = part.kind === "lookup" ? lookupMs : textLength(part) * msPerChar;
    steps.push({ part, startsAt: at, endsAt: at + ms });
    at += ms;
  }
  return { steps, endsAt: at };
}

function playPart({ part, startsAt, endsAt }: Step, elapsed: number, prefix: string): ChatPart[] {
  if (elapsed < startsAt) return [];
  if (part.kind === "lookup") {
    const state = elapsed < endsAt ? "running" : part.lookup.state;
    return [
      { kind: "lookup", lookup: { ...part.lookup, id: `${prefix}-${part.lookup.id}`, state } },
    ];
  }
  const shown =
    elapsed >= endsAt
      ? part.text.length
      : Math.floor((part.text.length * (elapsed - startsAt)) / (endsAt - startsAt));
  return [{ kind: "text", key: `${prefix}-${part.key}`, text: part.text.slice(0, shown) }];
}

function turnAnswer(turn: DemoTurn): ChatMessage | undefined {
  return findDemoThread(turn.answer)?.messages.find((message) => message.role === "assistant");
}

function playTurn(turn: DemoTurn, index: number, now: number): ChatMessage[] {
  const prefix = `${index}`;
  const question: ChatMessage = {
    key: `${prefix}-question`,
    role: "user",
    status: "done",
    sentAt: turn.startedAt,
    text: turn.question,
    parts: [{ kind: "text", key: `${prefix}-question-text`, text: turn.question }],
    sources: [],
  };
  const answer = turnAnswer(turn);
  if (!answer) return [question];
  const elapsed = Math.max(0, now - turn.startedAt);
  const { steps, endsAt } = schedule(answer);
  const done = elapsed >= endsAt;
  const parts = steps.flatMap((step) => playPart(step, elapsed, prefix));
  const reply: ChatMessage = {
    ...answer,
    key: `${prefix}-answer`,
    sentAt: turn.startedAt,
    status: done ? answer.status : parts.length > 0 ? "streaming" : "pending",
    text: done ? answer.text : "",
    parts,
    sources: done ? answer.sources : [],
  };
  return [question, reply];
}

export function playThread(thread: StoredThread, now: number): ChatMessage[] {
  return thread.turns.flatMap((turn, index) => playTurn(turn, index, now));
}

export function playbackEndsAt(thread: StoredThread): number {
  return Math.max(
    ...thread.turns.map((turn) => {
      const answer = turnAnswer(turn);
      return turn.startedAt + (answer ? schedule(answer).endsAt : 0);
    }),
  );
}
