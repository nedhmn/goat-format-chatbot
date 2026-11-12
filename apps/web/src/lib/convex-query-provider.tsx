import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";
import { z } from "zod";

function createClients() {
  const convexUrl = z
    .url({ error: "VITE_CONVEX_URL must be the Convex backend URL" })
    .parse(import.meta.env.VITE_CONVEX_URL);
  const convexClient = new ConvexReactClient(convexUrl);
  const convexQueryClient = new ConvexQueryClient(convexClient);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);
  return { convexClient, queryClient };
}

export function ConvexQueryProvider({ children }: { children: ReactNode }) {
  const [{ convexClient, queryClient }] = useState(createClients);
  return (
    <ConvexProvider client={convexClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConvexProvider>
  );
}
