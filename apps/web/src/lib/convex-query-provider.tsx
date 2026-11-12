import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, type ReactNode } from "react";

import { readLiveEnv } from "@/lib/env";

function createClients() {
  const env = readLiveEnv();
  const convexClient = new ConvexReactClient(env.VITE_CONVEX_URL);
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
