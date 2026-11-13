import { Markdown } from "@goat-format-chatbot/design-system/components/markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@goat-format-chatbot/design-system/components/tooltip";
import { Bubble, BubbleContent } from "@goat-format-chatbot/design-system/components/ui/bubble";
import { Button } from "@goat-format-chatbot/design-system/components/ui/button";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@goat-format-chatbot/design-system/components/ui/message";
import {
  Trace,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@goat-format-chatbot/design-system/components/ui/trace";
import { RiCheckLine, RiFileCopyLine, RiSparkling2Line } from "@remixicon/react";
import { useState } from "react";

import type { ChatMessage as ChatMessageData } from "@/features/chat/api/chat-message";
import { LookupTrace } from "@/features/chat/components/lookup-trace";
import { PresetChips } from "@/features/chat/components/preset-chips";
import { SourcesTrace } from "@/features/chat/components/sources-trace";
import { answerTime, fullTime } from "@/features/chat/utils/answer-time";
import { groupParts } from "@/features/chat/utils/group-parts";

export const NO_ANSWER = "The answer stopped before it finished. Ask again.";

const THINKING = "Reading the question";
const COPIED_FOR_MS = 2000;

function AnswerTime({ sentAt }: { sentAt: number }) {
  const sent = new Date(sentAt);
  return (
    <Tooltip>
      <TooltipTrigger render={<time dateTime={sent.toISOString()} className="px-1" />}>
        {answerTime(sent, new Date())}
      </TooltipTrigger>
      <TooltipContent>{fullTime(sent)}</TooltipContent>
    </Tooltip>
  );
}

function CopyAnswer({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FOR_MS);
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={copied ? "Copied" : "Copy answer"}
            onClick={copy}
          />
        }
      >
        {copied ? <RiCheckLine /> : <RiFileCopyLine />}
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied" : "Copy answer"}</TooltipContent>
    </Tooltip>
  );
}

export function ChatMessage({
  message,
  onPick,
}: {
  message: ChatMessageData;
  onPick: (question: string) => void;
}) {
  if (message.role === "user") {
    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end" variant="muted">
            <BubbleContent className="whitespace-pre-wrap">{message.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  const working = message.status === "pending" || message.status === "streaming";
  const groups = groupParts(message.parts);
  const last = groups.at(-1);

  return (
    <Message>
      <MessageContent className="gap-4">
        {groups.map((group) =>
          group.kind === "lookups" ? (
            <LookupTrace key={group.key} lookups={group.lookups} />
          ) : (
            <Markdown key={group.key} streaming={working && group === last}>
              {group.text}
            </Markdown>
          ),
        )}
        {working && !last ? (
          <Trace>
            <TraceLine status="running">
              <TraceIcon>
                <RiSparkling2Line />
              </TraceIcon>
              <TraceTitle>{THINKING}</TraceTitle>
            </TraceLine>
          </Trace>
        ) : null}
        {message.status === "failed" && !message.text ? (
          <p role="alert" className="text-sm text-destructive">
            {NO_ANSWER}
          </p>
        ) : null}
        {message.offersPresets ? <PresetChips onPick={onPick} wrap /> : null}
        {message.sources.length > 0 ? <SourcesTrace sources={message.sources} /> : null}
        {message.status === "done" && message.text ? (
          <MessageFooter className="gap-1 px-0">
            <CopyAnswer text={message.text} />
            <AnswerTime sentAt={message.sentAt} />
          </MessageFooter>
        ) : null}
      </MessageContent>
    </Message>
  );
}
