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

import { useThreadActions, type PastThread, type ThreadActions } from "@/features/chat/api/chat";

type ThreadRowProps = {
  thread: PastThread;
  pinned: boolean;
  active: boolean;
  onOpen: () => void;
};

export function ThreadRow(props: ThreadRowProps) {
  const actions = useThreadActions();
  if (actions) return <EditableThreadRow {...props} actions={actions} />;
  return (
    <SidebarMenuItem>
      <ThreadLink thread={props.thread} active={props.active} onOpen={props.onOpen} />
    </SidebarMenuItem>
  );
}

function ThreadLink({
  thread,
  active,
  onOpen,
}: Pick<ThreadRowProps, "thread" | "active" | "onOpen">) {
  return (
    <SidebarMenuButton
      isActive={active}
      render={
        <Link to="/threads/$threadId" params={{ threadId: thread.threadId }} onClick={onOpen} />
      }
    >
      <span>{thread.title}</span>
    </SidebarMenuButton>
  );
}

function EditableThreadRow({
  thread,
  pinned,
  active,
  onOpen,
  actions: { pin, rename, remove },
}: ThreadRowProps & { actions: ThreadActions }) {
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
        <ThreadLink thread={thread} active={active} onOpen={onOpen} />
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
