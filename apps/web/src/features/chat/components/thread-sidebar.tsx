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
import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { usePastThreads, usePinnedThreads } from "@/features/chat/api/chat";
import { ThreadRow } from "@/features/chat/components/thread-row";
import { groupByActivity } from "@/features/chat/utils/thread-groups";

const LOADING_ROWS = 4;

const LOAD_AHEAD = "200px";

function useLoadOnScroll(loadMore: (() => void) | undefined) {
  return useCallback(
    (sentinel: HTMLElement | null) => {
      if (!sentinel || !loadMore) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) loadMore();
        },
        { rootMargin: LOAD_AHEAD },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    },
    [loadMore],
  );
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
  const [search, setSearch] = useState("");
  const { threads, loading, loadMore } = usePastThreads(search);
  const loadSentinel = useLoadOnScroll(loadMore);
  const searching = search.trim() !== "";
  const pinned = usePinnedThreads();
  const pinnedIds = new Set(pinned.map((thread) => thread.threadId));
  const groups = (
    searching
      ? [{ label: "Results", threads }]
      : [{ label: "Pinned", threads: pinned }, ...groupByActivity(threads, new Date())]
  ).filter((group) => group.threads.length > 0);
  const searchInput = useRef<HTMLInputElement>(null);
  const openThreadId = useParams({ strict: false, select: (params) => params.threadId });
  const { isMobile, setOpen, setOpenMobile, toggleSidebar } = useSidebar();

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
        {loading ? (
          <SidebarGroup>
            <SidebarGroupLabel>Past questions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: LOADING_ROWS }, (_, row) => (
                  <SidebarMenuItem key={row}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {!loading && groups.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Past questions</SidebarGroupLabel>
            <p className="px-3 py-1.5 text-sm text-muted-foreground">
              {searching ? "No questions match." : "No questions yet."}
            </p>
          </SidebarGroup>
        ) : null}
        {loading
          ? null
          : groups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.threads.map((thread) => (
                      <ThreadRow
                        key={thread.threadId}
                        thread={thread}
                        pinned={pinnedIds.has(thread.threadId)}
                        active={thread.threadId === openThreadId}
                        onOpen={closeOnMobile}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
        {loadMore ? <div ref={loadSentinel} aria-hidden className="h-px shrink-0" /> : null}
      </SidebarContent>
      {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
    </Sidebar>
  );
}
