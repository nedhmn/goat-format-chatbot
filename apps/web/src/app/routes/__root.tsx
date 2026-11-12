import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@goat-format-chatbot/design-system/components/sidebar";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

import { ThreadSidebar } from "@/features/chat/components/thread-sidebar";

const SIDEBAR_CLOSED_COOKIE = "sidebar_state=false";

function sidebarOpenAtLoad(): boolean {
  return !document.cookie.split("; ").includes(SIDEBAR_CLOSED_COOKIE);
}

function RootLayout() {
  return (
    <SidebarProvider defaultOpen={sidebarOpenAtLoad()} className="h-dvh">
      <ThreadSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-2 md:hidden">
          <SidebarTrigger aria-label="Open sidebar" />
          <Link to="/" className="font-heading text-base text-text-primary no-underline">
            Goat Format Chatbot
          </Link>
        </header>
        <div className="flex min-h-0 flex-1 flex-col px-4 md:px-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Route = createRootRoute({ component: RootLayout });
