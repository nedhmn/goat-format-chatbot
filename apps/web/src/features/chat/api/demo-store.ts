import { z } from "zod";

const STORAGE_KEY = "demo-threads";

const demoTurn = z.object({ question: z.string(), answer: z.string(), startedAt: z.number() });

const storedThread = z.object({
  id: z.string(),
  title: z.string(),
  turns: z.array(demoTurn).min(1),
});

export type DemoTurn = z.infer<typeof demoTurn>;

export type StoredThread = z.infer<typeof storedThread>;

const listeners = new Set<() => void>();

let threads: StoredThread[] | undefined;

function load(): StoredThread[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const parsed = z.array(storedThread).safeParse(stored);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

function persist(next: StoredThread[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

export function storedThreads(): StoredThread[] {
  threads ??= load();
  return threads;
}

export function subscribeStoredThreads(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function lastActive(thread: StoredThread): number {
  return thread.turns.at(-1)?.startedAt ?? 0;
}

export function addTurn(threadId: string | undefined, turn: DemoTurn, title: string): string {
  const current = storedThreads();
  const existing = current.find((thread) => thread.id === threadId);
  const thread = existing
    ? { ...existing, turns: [...existing.turns, turn] }
    : { id: crypto.randomUUID(), title, turns: [turn] };
  threads = [thread, ...current.filter((other) => other.id !== thread.id)];
  persist(threads);
  for (const listener of listeners) listener();
  return thread.id;
}
