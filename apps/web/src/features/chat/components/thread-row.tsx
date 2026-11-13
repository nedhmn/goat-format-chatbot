import {
  SidebarInput,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@goat-format-chatbot/design-system/components/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@goat-format-chatbot/design-system/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@goat-format-chatbot/design-system/components/ui/dropdown-menu";
import {
  RiDeleteBinLine,
  RiMoreLine,
  RiPencilLine,
  RiPushpinLine,
  RiUnpinLine,
} from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { useThreadActions, type PastThread } from "@/features/chat/api/chat";

export function ThreadRow({
  thread,
  pinned,
  active,
  onOpen,
}: {
  thread: PastThread;
  pinned: boolean;
  active: boolean;
  onOpen: () => void;
}) {
  const { pin, rename, remove } = useThreadActions();
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const renameInput = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);

  const startRename = () => {
    cancelled.current = false;
    setRenaming(true);
  };

  const keyRename = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") cancelled.current = true;
    if (event.key === "Enter" || event.key === "Escape") event.currentTarget.blur();
  };

  const saveRename = (event: FocusEvent<HTMLInputElement>) => {
    setRenaming(false);
    const title = event.currentTarget.value.trim();
    if (!cancelled.current && title && title !== thread.title) void rename(thread.threadId, title);
  };

  const confirmDelete = async () => {
    setConfirming(false);
    if (active) await navigate({ to: "/" });
    await remove(thread.threadId);
  };

  return (
    <SidebarMenuItem>
      {renaming ? (
        <SidebarInput
          ref={renameInput}
          aria-label="Thread title"
          defaultValue={thread.title}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={keyRename}
          onBlur={saveRename}
        />
      ) : (
        <SidebarMenuButton
          isActive={active}
          render={
            <Link to="/threads/$threadId" params={{ threadId: thread.threadId }} onClick={onOpen} />
          }
        >
          <span>{thread.title}</span>
        </SidebarMenuButton>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction
              showOnHover
              aria-label={`More for ${thread.title}`}
              className={renaming ? "hidden" : undefined}
            />
          }
        >
          <RiMoreLine />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44"
          finalFocus={() => renameInput.current ?? true}
        >
          <DropdownMenuItem onClick={() => void pin(thread.threadId, !pinned)}>
            {pinned ? <RiUnpinLine /> : <RiPushpinLine />}
            {pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={startRename}>
            <RiPencilLine />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            <RiDeleteBinLine />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this thread?</AlertDialogTitle>
            <AlertDialogDescription>
              "{thread.title}" and its answers will be gone for good.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmDelete()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  );
}
