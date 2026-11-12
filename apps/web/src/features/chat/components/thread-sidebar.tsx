import { Button } from "@goat-format-chatbot/design-system/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@goat-format-chatbot/design-system/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@goat-format-chatbot/design-system/components/ui/tooltip";
import { RiAddLine, RiContractLeftLine, RiExpandRightLine, RiSearchLine } from "@remixicon/react";
import { Link, useParams } from "@tanstack/react-router";
import { useRef, useState, type KeyboardEvent } from "react";

import { usePastThreads, type PastThread } from "@/features/chat/api/chat";

const LOADING_ROWS = 4;

const SHOWN_WHEN_COLLAPSED = "hidden group-data-[collapsible=icon]:flex";

const HIDDEN_WHEN_COLLAPSED = "group-data-[collapsible=icon]:hidden";

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

export function ThreadSidebar() {
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
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className={`flex items-center gap-2 ${HIDDEN_WHEN_COLLAPSED}`}>
            <Link
              to="/"
              onClick={closeOnMobile}
              className="truncate px-2 font-heading text-base text-sidebar-foreground no-underline"
            >
              Goat Format Chatbot
            </Link>
            <CollapseButton />
          </SidebarMenuItem>
          <SidebarMenuItem className={SHOWN_WHEN_COLLAPSED}>
            <SidebarMenuButton tooltip="Expand sidebar" onClick={toggleSidebar}>
              <RiExpandRightLine />
              <span>Expand sidebar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className={`relative ${HIDDEN_WHEN_COLLAPSED}`}>
          <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            ref={searchInput}
            type="search"
            aria-label="Search past questions"
            placeholder="Search"
            className="pl-8 [&::-webkit-search-cancel-button]:appearance-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={clearOnEscape}
          />
        </div>
        <SidebarMenu>
          <SidebarMenuItem className={SHOWN_WHEN_COLLAPSED}>
            <SidebarMenuButton tooltip="Search" onClick={openSearch}>
              <RiSearchLine />
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
        <SidebarGroup className={HIDDEN_WHEN_COLLAPSED}>
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
                        <span className="truncate">{thread.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
            {!loading && shown.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                {threads.length === 0 ? "No questions yet." : "No questions match."}
              </p>
            ) : null}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
