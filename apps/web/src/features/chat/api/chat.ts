import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "@goat-format-chatbot/backend/convex/_generated/api";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

import { toChatMessage, type ChatMessage } from "./chat-message";
import { demoThreads, findDemoThread, type DemoThread } from "./demo-threads";
import { SUGGESTIONS } from "./suggestions";

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

export type Suggestion = { question: string; threadId?: string };

export const SEND_FAILED = "The question could not be sent. Check that the backend is running.";

export const DEMO_NOTICE =
  "This demo has no backend, so it cannot answer questions. Run the app locally to ask one.";

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

const liveSuggestions: Suggestion[] = SUGGESTIONS.map((question) => ({ question }));

function useLiveSuggestions(): Suggestion[] {
  return liveSuggestions;
}

function useDemoAsk(): Ask {
  return useCallback(async () => ({ ok: false, error: DEMO_NOTICE }), []);
}

const noMessages: ChatMessage[] = [];

function useDemoThreadMessages(threadId: string): ThreadMessages {
  return { messages: findDemoThread(threadId)?.messages ?? noMessages, loading: false };
}

function toDemoPastThread({ id, title, activeAt }: DemoThread): PastThread {
  return { threadId: id, title, activeAt };
}

const demoPastThreads = demoThreads.map(toDemoPastThread);

function useDemoPastThreads(search: string): PastThreads {
  const words = search.trim().toLowerCase();
  const threads = useMemo(
    () =>
      words
        ? demoPastThreads.filter((thread) => thread.title.toLowerCase().includes(words))
        : demoPastThreads,
    [words],
  );
  return { threads, loading: false, loadMore: undefined };
}

const noPins: PastThread[] = [];

function useDemoPinnedThreads(): PastThread[] {
  return noPins;
}

function useDemoThreadTitle(threadId: string): string | undefined {
  return findDemoThread(threadId)?.title;
}

function useDemoThreadActions(): ThreadActions | undefined {
  return undefined;
}

function recordedThreadId(question: string) {
  return demoThreads.find((thread) => thread.messages[0]?.text === question)?.id;
}

const demoSuggestions: Suggestion[] = SUGGESTIONS.map((question) => ({
  question,
  threadId: recordedThreadId(question),
}));

function useDemoSuggestions(): Suggestion[] {
  return demoSuggestions;
}

const demo = import.meta.env.MODE === "demo";

export const chatAvailable = !demo;
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
export const useSuggestions: () => Suggestion[] = demo ? useDemoSuggestions : useLiveSuggestions;
