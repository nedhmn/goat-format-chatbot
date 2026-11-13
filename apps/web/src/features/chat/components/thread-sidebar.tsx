import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSwap,
  useSidebar,
} from "@goat-format-chatbot/design-system/components/sidebar";
import { Button } from "@goat-format-chatbot/design-system/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@goat-format-chatbot/design-system/components/ui/tooltip";
import { RiAddLine, RiContractLeftLine, RiExpandRightLine, RiSearchLine } from "@remixicon/react";
import { Link, useParams } from "@tanstack/react-router";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { usePastThreads, type PastThread } from "@/features/chat/api/chat";

const LOADING_ROWS = 4;

function matching(threads: PastThread[], search: string): PastThread[] {
  const needle = search.trim().toLowerCase();
  return needle ? threads.filter((thread) => thread.title.toLowerCase().includes(needle)) : threads;
}

function CollapseButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Collapse sidebar"
            className="ml-auto text-muted-foreground"
            onClick={toggleSidebar}
          />
        }
      >
        <RiContractLeftLine />
      </TooltipTrigger>
      <TooltipContent side="right">Collapse sidebar</TooltipContent>
    </Tooltip>
  );
}

export function ThreadSidebar({ footer }: { footer?: ReactNode }) {
  const { threads, loading } = usePastThreads();
  const [search, setSearch] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const openThreadId = useParams({ strict: false, select: (params) => params.threadId });
  const { isMobile, setOpen, setOpenMobile, toggleSidebar } = useSidebar();
  const shown = matching(threads, search);

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const openSearch = () => {
    setOpen(true);
    requestAnimationFrame(() => searchInput.current?.focus());
  };

  const clearOnEscape = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setSearch("");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarSwap
          expanded={
            <>
              <Link
                to="/"
                onClick={closeOnMobile}
                className="truncate px-3 font-heading text-sm text-sidebar-foreground no-underline"
              >
                Goat Format Chatbot
              </Link>
              <CollapseButton />
            </>
          }
          collapsed={
            <SidebarMenuButton tooltip="Expand sidebar" onClick={toggleSidebar}>
              <RiExpandRightLine />
              <span>Expand sidebar</span>
            </SidebarMenuButton>
          }
        />
        <SidebarSwap
          expanded={
            <div className="relative w-full">
              <RiSearchLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <SidebarInput
                ref={searchInput}
                type="search"
                aria-label="Search past questions"
                placeholder="Search"
                className="pl-9.5 [&::-webkit-search-cancel-button]:appearance-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={clearOnEscape}
              />
            </div>
          }
          collapsed={
            <SidebarMenuButton tooltip="Search" onClick={openSearch}>
              <RiSearchLine />
              <span>Search</span>
            </SidebarMenuButton>
          }
        />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New chat"
              isActive={openThreadId === undefined}
              render={<Link to="/" onClick={closeOnMobile} />}
            >
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
                : shown.map((thread) => (
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
                        <span>{thread.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
            {!loading && shown.length === 0 ? (
              <p className="px-3 py-1.5 text-sm text-muted-foreground">
                {threads.length === 0 ? "No questions yet." : "No questions match."}
              </p>
            ) : null}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
    </Sidebar>
  );
}
