import { createFileRoute } from "@tanstack/react-router";

import { NewChat } from "@/features/chat/components/new-chat";

export const Route = createFileRoute("/")({ component: NewChat });
