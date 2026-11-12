import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { ConvexQueryProvider } from "@/lib/convex-query-provider";

function DemoProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export const AppProvider = import.meta.env.MODE === "demo" ? DemoProvider : ConvexQueryProvider;
