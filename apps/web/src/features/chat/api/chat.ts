import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "@goat-format-chatbot/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useCallback, useMemo } from "react";
import { z } from "zod";

import { toChatMessage, type ChatMessage } from "./chat-message";

export type Sent = { ok: true; threadId: string } | { ok: false; error: string };

export type Ask = (question: string) => Promise<Sent>;

export type ThreadMessages = { messages: ChatMessage[]; loading: boolean };

export type PastThread = { threadId: string; title: string };

export type PastThreads = { threads: PastThread[]; loading: boolean };

export const SEND_FAILED = "The question could not be sent. Check that the backend is running.";

export const DEMO_NOTICE =
  "This demo has no backend, so it cannot answer questions. Run the app locally to ask one.";

const INITIAL_MESSAGES = 50;

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

function useLivePastThreads(): PastThreads {
  const listed = useQuery(api.chat.threads, {});
  const threads = useMemo(
    () => (listed ?? []).map(({ threadId, title }) => ({ threadId, title })),
    [listed],
  );
  return { threads, loading: listed === undefined };
}

function useDemoAsk(): Ask {
  return useCallback(async () => ({ ok: false, error: DEMO_NOTICE }), []);
}

function useDemoThreadMessages(): ThreadMessages {
  return { messages: [], loading: false };
}

function useDemoPastThreads(): PastThreads {
  return { threads: [], loading: false };
}

const demo = import.meta.env.MODE === "demo";

export const chatAvailable = !demo;
export const useAsk: (threadId?: string) => Ask = demo ? useDemoAsk : useLiveAsk;
export const useThreadMessages: (threadId: string) => ThreadMessages = demo
  ? useDemoThreadMessages
  : useLiveThreadMessages;
export const usePastThreads: () => PastThreads = demo ? useDemoPastThreads : useLivePastThreads;
