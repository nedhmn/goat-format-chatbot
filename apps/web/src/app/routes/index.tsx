import { createFileRoute } from "@tanstack/react-router";

function NewThread() {
  return <h1 className="font-heading text-3xl text-text-primary">Goat Format Chatbot</h1>;
}

export const Route = createFileRoute("/")({ component: NewThread });
