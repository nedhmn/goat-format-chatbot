import "@goat-format-chatbot/design-system/styles.css";
import { Badge } from "@goat-format-chatbot/design-system/components/badge";
import { Button } from "@goat-format-chatbot/design-system/components/button";
import { Card } from "@goat-format-chatbot/design-system/components/card";
import { Code, CodeBlock } from "@goat-format-chatbot/design-system/components/code";
import { Input, Textarea } from "@goat-format-chatbot/design-system/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@goat-format-chatbot/design-system/components/tooltip";
import { RiFileCopyLine, RiSendPlane2Line, RiStopCircleLine } from "@remixicon/react";
import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

const variants = ["primary", "secondary", "outline", "ghost"] as const;
const sizes = ["sm", "md", "lg"] as const;
const badges = ["neutral", "accent", "success", "error", "outline"] as const;
const cards = ["elevated", "outlined", "plain"] as const;

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
