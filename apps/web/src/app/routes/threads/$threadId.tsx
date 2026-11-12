import { createFileRoute } from "@tanstack/react-router";

function Thread() {
  const { threadId } = Route.useParams();
  return <h1 className="font-heading text-3xl text-text-primary">Thread {threadId}</h1>;
}

export const Route = createFileRoute("/threads/$threadId")({ component: Thread });
