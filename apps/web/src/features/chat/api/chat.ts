import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "@goat-format-chatbot/backend/convex/_generated/api";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { z } from "zod";

import { toChatMessage, type ChatMessage } from "./chat-message";
import { clockUntil, readClock } from "./demo-clock";
import { FALLBACK, playbackEndsAt, playThread } from "./demo-playback";
import {
  addTurn,
  lastActive,
  storedThreads,
  subscribeStoredThreads,
  type StoredThread,
} from "./demo-store";
import { findPreset } from "./demo-threads";

export type Sent = { ok: true; threadId: string } | { ok: false; error: string };

export type Ask = (question: string) => Promise<Sent>;

export type ThreadMessages = { messages: ChatMessage[]; loading: boolean };

export type PastThread = { threadId: string; title: string; activeAt: number };

export type PastThreads = {
  threads: PastThread[];
  loading: boolean;
  loadMore: (() => void) | undefined;
};

export type ThreadActions = {
  pin: (threadId: string, pinned: boolean) => Promise<void>;
  rename: (threadId: string, title: string) => Promise<void>;
  remove: (threadId: string) => Promise<void>;
};

export const SEND_FAILED = "The question could not be sent. Check that the backend is running.";

const DEMO_PLACEHOLDER = "Pick a question above";

const INITIAL_MESSAGES = 50;

const THREADS_PER_PAGE = 30;

const errorMessage = z.string();

function useLiveAsk(threadId?: string): Ask {
  const send = useMutation(api.chat.send);
  return useCallback(
    async (question) => {
      try {
        const sent = await send({ question, threadId });
        return { ok: true, threadId: sent.threadId };
      } catch (error) {
        const shown = errorMessage.safeParse(error instanceof ConvexError ? error.data : undefined);
        return { ok: false, error: shown.success ? shown.data : SEND_FAILED };
      }
    },
    [send, threadId],
  );
}

function useLiveThreadMessages(threadId: string): ThreadMessages {
  const { results, status } = useUIMessages(
    api.chat.messages,
    { threadId },
    { initialNumItems: INITIAL_MESSAGES, stream: true },
  );
  const messages = useMemo(() => results.flatMap(toChatMessage), [results]);
  return { messages, loading: status === "LoadingFirstPage" };
}

function toPastThread({ threadId, title, activeAt }: PastThread): PastThread {
  return { threadId, title, activeAt };
}

function useLivePastThreads(search: string): PastThreads {
  const words = search.trim();
  const listed = usePaginatedQuery(api.chat.threads, words ? "skip" : {}, {
    initialNumItems: THREADS_PER_PAGE,
  });
  const found = useQuery(api.chat.searchThreads, words ? { query: words } : "skip");
  const [lastFound, setLastFound] = useState(found);
  if (found !== undefined && found !== lastFound) setLastFound(found);
  const { loadMore: loadPage, status, results } = listed;
  const loadMore = useCallback(() => loadPage(THREADS_PER_PAGE), [loadPage]);
  const searched = found ?? lastFound;
  const threads = useMemo(
    () => (words ? (searched ?? []) : results).map(toPastThread),
    [words, searched, results],
  );
  if (words) return { threads, loading: searched === undefined, loadMore: undefined };
  return {
    threads,
    loading: status === "LoadingFirstPage",
    loadMore: status === "CanLoadMore" ? loadMore : undefined,
  };
}

function useLivePinnedThreads(): PastThread[] {
  const pinned = useQuery(api.chat.pinnedThreads, {});
  return useMemo(() => (pinned ?? []).map(toPastThread), [pinned]);
}

function useLiveThreadTitle(threadId: string): string | undefined {
  return useQuery(api.chat.thread, { threadId })?.title;
}

function useLiveThreadActions(): ThreadActions {
  const pinThread = useMutation(api.chat.pin);
  const renameThread = useMutation(api.chat.rename);
  const removeThread = useMutation(api.chat.remove);
  return useMemo(
    () => ({
      pin: async (threadId, pinned) => {
        await pinThread({ threadId, pinned });
      },
      rename: async (threadId, title) => {
        await renameThread({ threadId, title });
      },
      remove: async (threadId) => {
        await removeThread({ threadId });
      },
    }),
    [pinThread, renameThread, removeThread],
  );
}

function useDemoAsk(threadId?: string): Ask {
  return useCallback(
    async (question: string): Promise<Sent> => {
      const asked = question.trim();
      const preset = findPreset(asked);
      const turn = { question: asked, answer: preset?.id ?? FALLBACK, startedAt: Date.now() };
      return { ok: true, threadId: addTurn(threadId, turn, preset?.title ?? asked) };
    },
    [threadId],
  );
}

function useStoredThreads(): StoredThread[] {
  return useSyncExternalStore(subscribeStoredThreads, storedThreads);
}

function useStoredThread(threadId: string): StoredThread | undefined {
  return useStoredThreads().find((thread) => thread.id === threadId);
}

const noMessages: ChatMessage[] = [];

function useDemoThreadMessages(threadId: string): ThreadMessages {
  const thread = useStoredThread(threadId);
  const endsAt = thread ? playbackEndsAt(thread) : 0;
  const subscribe = useMemo(() => clockUntil(endsAt), [endsAt]);
  const now = useSyncExternalStore(subscribe, readClock);
  const messages = useMemo(() => (thread ? playThread(thread, now) : noMessages), [thread, now]);
  return { messages, loading: false };
}

function toDemoPastThread(thread: StoredThread): PastThread {
  return { threadId: thread.id, title: thread.title, activeAt: lastActive(thread) };
}

function useDemoPastThreads(search: string): PastThreads {
  const stored = useStoredThreads();
  const words = search.trim().toLowerCase();
  const threads = useMemo(() => {
    const visited = stored.map(toDemoPastThread);
    return words ? visited.filter((thread) => thread.title.toLowerCase().includes(words)) : visited;
  }, [stored, words]);
  return { threads, loading: false, loadMore: undefined };
}

const noPins: PastThread[] = [];

function useDemoPinnedThreads(): PastThread[] {
  return noPins;
}

function useDemoThreadTitle(threadId: string): string | undefined {
  return useStoredThread(threadId)?.title;
}

function useDemoThreadActions(): ThreadActions | undefined {
  return undefined;
}

const demo = import.meta.env.MODE === "demo";

export const inputPlaceholder = demo ? DEMO_PLACEHOLDER : undefined;
export const suggestionsSend = demo;
export const useAsk: (threadId?: string) => Ask = demo ? useDemoAsk : useLiveAsk;
export const useThreadMessages: (threadId: string) => ThreadMessages = demo
  ? useDemoThreadMessages
  : useLiveThreadMessages;
export const usePastThreads: (search: string) => PastThreads = demo
  ? useDemoPastThreads
  : useLivePastThreads;
export const usePinnedThreads: () => PastThread[] = demo
  ? useDemoPinnedThreads
  : useLivePinnedThreads;
export const useThreadActions: () => ThreadActions | undefined = demo
  ? useDemoThreadActions
  : useLiveThreadActions;
export const useThreadTitle: (threadId: string) => string | undefined = demo
  ? useDemoThreadTitle
  : useLiveThreadTitle;
