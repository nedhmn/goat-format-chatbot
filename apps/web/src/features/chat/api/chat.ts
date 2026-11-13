import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "@goat-format-chatbot/backend/convex/_generated/api";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

import { toChatMessage, type ChatMessage } from "./chat-message";

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

function useDemoAsk(): Ask {
  return useCallback(async () => ({ ok: false, error: DEMO_NOTICE }), []);
}

function useDemoThreadMessages(): ThreadMessages {
  return { messages: [], loading: false };
}

function useDemoPastThreads(): PastThreads {
  return { threads: [], loading: false, loadMore: undefined };
}

const noPins: PastThread[] = [];

function useDemoPinnedThreads(): PastThread[] {
  return noPins;
}

async function nothing() {}

const demoActions: ThreadActions = { pin: nothing, rename: nothing, remove: nothing };

function useDemoThreadActions(): ThreadActions {
  return demoActions;
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
export const useThreadActions: () => ThreadActions = demo
  ? useDemoThreadActions
  : useLiveThreadActions;
