import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@goat-format-chatbot/design-system/components/ui/sidebar";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

import { ThreadSidebar } from "@/features/chat/components/thread-sidebar";

function RootLayout() {
  return (
    <SidebarProvider className="h-dvh">
      <ThreadSidebar />
      <SidebarInset className="min-h-0">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <Link to="/" className="font-heading text-lg text-text-primary no-underline">
            Goat Format Chatbot
          </Link>
        </header>
        <div className="flex min-h-0 flex-1 flex-col px-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createRootRoute({ component: RootLayout });
