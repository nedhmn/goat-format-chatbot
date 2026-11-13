import "@goat-format-chatbot/design-system/styles.css";
import { Badge } from "@goat-format-chatbot/design-system/components/badge";
import { Button } from "@goat-format-chatbot/design-system/components/button";
import { Card } from "@goat-format-chatbot/design-system/components/card";
import { Code, CodeBlock } from "@goat-format-chatbot/design-system/components/code";
import { Input, Textarea } from "@goat-format-chatbot/design-system/components/input";
import { Markdown } from "@goat-format-chatbot/design-system/components/markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@goat-format-chatbot/design-system/components/tooltip";
import { Avatar, AvatarFallback } from "@goat-format-chatbot/design-system/components/ui/avatar";
import { Bubble, BubbleContent } from "@goat-format-chatbot/design-system/components/ui/bubble";
import { Button as UiButton } from "@goat-format-chatbot/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@goat-format-chatbot/design-system/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@goat-format-chatbot/design-system/components/ui/hover-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@goat-format-chatbot/design-system/components/ui/input-group";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@goat-format-chatbot/design-system/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@goat-format-chatbot/design-system/components/ui/message-scroller";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@goat-format-chatbot/design-system/components/ui/trace";
import {
  RiArrowRightUpLine,
  RiArrowUpLine,
  RiBookOpenLine,
  RiFileCopyLine,
  RiGlobalLine,
  RiSearchLine,
  RiSendPlane2Line,
  RiStopCircleLine,
  RiUserLine,
} from "@remixicon/react";
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

const variants = ["primary", "secondary", "outline", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;
const badges = ["neutral", "accent", "success", "error", "outline"] as const;
const cards = ["elevated", "outlined", "plain"] as const;

const answer = `**No.** Book of Moon cannot be activated during the Damage Step.

Only monster effects and Counter Traps can negate there, and Book of Moon changes neither ATK nor DEF.

\`\`\`text
CL1: Mystical Space Typhoon
CL2: Book of Moon
\`\`\``;

const lookups = [
  { title: "Looked up Book of Moon", icon: <RiSearchLine />, status: undefined },
  { title: "Read rulings for Book of Moon", icon: <RiBookOpenLine />, status: undefined },
  { title: 'Searched rulings for "damage step"', icon: <RiSearchLine />, status: "error" },
] as const;

const sources = [
  { title: "Book of Moon", url: "https://beta.goatformat.com/cards/book-of-moon" },
  { title: "Damage Step", url: "https://beta.goatformat.com/learn/rulings#damage-step" },
];

const suggestions = [
  "Can Sinister Serpent return during the End Phase?",
  "Does Sangan trigger if it is banished?",
  "Can Breaker use a counter the turn it is summoned?",
];

function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t py-8">
      <h2 className="font-heading text-xl">{name}</h2>
      {children}
    </section>
  );
}

function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

function Specimen() {
  return (
    <TooltipProvider>
      <main className="mx-auto max-w-layout px-4 py-12">
        <header className="flex items-center justify-between gap-4 pb-8">
          <h1 className="font-heading text-3xl">Design system</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTheme(false)}>
              Light
            </Button>
            <Button variant="outline" onClick={() => setTheme(true)}>
              Dark
            </Button>
          </div>
        </header>

        <Section name="Button">
          {sizes.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              {variants.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant} {size}
                </Button>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <RiSendPlane2Line aria-hidden />
              Send
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <Button variant="outline" render={<a href="#tooltip" />}>
              Link to tooltip
            </Button>
          </div>
        </Section>

        <Section name="Tooltip">
          <div id="tooltip" className="flex gap-3">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" aria-label="Copy answer">
                    <RiFileCopyLine aria-hidden />
                  </Button>
                }
              />
              <TooltipContent>Copy answer</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" aria-label="Stop generating">
                    <RiStopCircleLine aria-hidden />
                  </Button>
                }
              />
              <TooltipContent side="bottom">Stop generating</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        <Section name="Avatar">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>
                <RiUserLine />
              </AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>GF</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        <Section name="Dropdown menu">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline">You</Button>} />
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <DropdownMenuRadioGroup defaultValue="system">
                    <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <RiFileCopyLine />
                  Copy link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Section>

        <Section name="Badge">
          <div className="flex flex-wrap gap-2">
            {badges.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
            <Badge mono>mono</Badge>
          </div>
        </Section>

        <Section name="Card">
          <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((variant) => (
              <Card key={variant} variant={variant} className="p-4">
                {variant}
              </Card>
            ))}
          </div>
          <Card interactive className="p-4">
            interactive
          </Card>
        </Section>

        <Section name="Input">
          <Input placeholder="Ask about a ruling" />
          <Textarea placeholder="Describe the chain" />
        </Section>

        <Section name="Code and prose">
          <div className="prose">
            <p>
              Activating <Code>Ash Blossom &amp; Joyous Spring</Code> negates the effect, not the
              activation.
            </p>
            <ul>
              <li>Chain Link 1 resolves last.</li>
              <li>Costs are paid on activation.</li>
            </ul>
          </div>
          <CodeBlock>{"CL1: Pot of Prosperity\nCL2: Ash Blossom & Joyous Spring"}</CodeBlock>
        </Section>

        <Section name="Chat">
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="h-[28rem] rounded-lg border">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-6 p-4 text-sm">
                  <MessageScrollerItem messageId="question" scrollAnchor>
                    <Message align="end">
                      <MessageContent>
                        <Bubble align="end" variant="muted">
                          <BubbleContent>
                            Can Book of Moon be activated during the damage step?
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                  <MessageScrollerItem messageId="answer">
                    <Message>
                      <MessageContent className="gap-4">
                        <Trace>
                          {lookups.map((lookup) => (
                            <TraceLine key={lookup.title} status={lookup.status}>
                              <TraceIcon>{lookup.icon}</TraceIcon>
                              <TraceTitle>{lookup.title}</TraceTitle>
                            </TraceLine>
                          ))}
                        </Trace>
                        <Markdown>{answer}</Markdown>
                        <Trace>
                          <TraceCollapsible>
                            <TraceCollapsibleTrigger>
                              <TraceLine>
                                <TraceIcon>
                                  <RiGlobalLine />
                                </TraceIcon>
                                <TraceTitle>Used {sources.length} sources</TraceTitle>
                              </TraceLine>
                            </TraceCollapsibleTrigger>
                            <TraceCollapsibleContent>
                              <Trace>
                                {sources.map((source) => (
                                  <a
                                    key={source.url}
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <TraceLine>
                                      <TraceTitle>
                                        {source.title}{" "}
                                        <span className="sr-only">(opens in a new tab)</span>
                                      </TraceTitle>
                                      <TraceIcon>
                                        <RiArrowRightUpLine />
                                      </TraceIcon>
                                    </TraceLine>
                                  </a>
                                ))}
                              </Trace>
                            </TraceCollapsibleContent>
                          </TraceCollapsible>
                        </Trace>
                        <MessageFooter>
                          <UiButton variant="ghost" size="icon-sm" aria-label="Copy answer">
                            <RiFileCopyLine />
                          </UiButton>
                        </MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                  <MessageScrollerItem messageId="streaming">
                    <Message>
                      <MessageContent className="gap-4">
                        <Trace>
                          <TraceLine status="running">
                            <TraceIcon>
                              <RiBookOpenLine />
                            </TraceIcon>
                            <TraceTitle>Reading rulings for Ring of Destruction</TraceTitle>
                          </TraceLine>
                        </Trace>
                        <Markdown streaming>
                          {"**Yes,** Ring of Destruction can be **chain"}
                        </Markdown>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
          <p className="text-sm">
            Damage Step rulings come from the{" "}
            <HoverCard>
              <HoverCardTrigger
                delay={10}
                closeDelay={100}
                render={<UiButton variant="secondary" size="xs" />}
              >
                goatformat.com
              </HoverCardTrigger>
              <HoverCardContent className="flex w-64 flex-col gap-1">
                <span className="font-medium">Damage Step</span>
                <span className="text-muted-foreground">
                  Only Counter Traps and effects that change ATK or DEF can be activated.
                </span>
              </HoverCardContent>
            </HoverCard>{" "}
            rulings page.
          </p>
          <div className="scrollbar-none flex scroll-fade-x gap-2 overflow-x-auto">
            {suggestions.map((suggestion) => (
              <UiButton key={suggestion} variant="outline" size="sm" className="shrink-0">
                {suggestion}
              </UiButton>
            ))}
          </div>
          <form onSubmit={(event) => event.preventDefault()}>
            <InputGroup>
              <InputGroupTextarea placeholder="Ask about a ruling" className="p-3" />
              <InputGroupAddon align="block-end">
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  className="ml-auto rounded-full"
                  aria-label="Send"
                >
                  <RiArrowUpLine />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </Section>
      </main>
    </TooltipProvider>
  );
}

const root = document.querySelector("#root");

if (root)
  createRoot(root).render(
    <StrictMode>
      <Specimen />
    </StrictMode>,
  );
