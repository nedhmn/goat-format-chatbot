import { createFileRoute } from "@tanstack/react-router";

import { chatAvailable } from "@/features/chat/api/chat";
import { DemoHome } from "@/features/chat/components/demo-home";
import { NewChat } from "@/features/chat/components/new-chat";

export const Route = createFileRoute("/")({ component: chatAvailable ? NewChat : DemoHome });
