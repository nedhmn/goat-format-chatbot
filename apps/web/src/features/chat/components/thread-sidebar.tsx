import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@goat-format-chatbot/design-system/components/ui/sidebar";
import { RiAddLine } from "@remixicon/react";
import { Link, useParams } from "@tanstack/react-router";

import { usePastThreads } from "@/features/chat/api/chat";

const LOADING_ROWS = 4;

export function ThreadSidebar() {
  const { threads, loading } = usePastThreads();
  const openThreadId = useParams({ strict: false, select: (params) => params.threadId });
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/" onClick={closeOnMobile} />}>
              <RiAddLine />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Past questions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading
                ? Array.from({ length: LOADING_ROWS }, (_, row) => (
                    <SidebarMenuItem key={row}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))
                : threads.map((thread) => (
                    <SidebarMenuItem key={thread.threadId}>
                      <SidebarMenuButton
                        isActive={thread.threadId === openThreadId}
                        render={
                          <Link
                            to="/threads/$threadId"
                            params={{ threadId: thread.threadId }}
                            onClick={closeOnMobile}
                          />
                        }
                      >
                        <span className="truncate">{thread.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
            {!loading && threads.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">No questions yet.</p>
            ) : null}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
