import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@goat-format-chatbot/design-system/components/sidebar";
import { Avatar, AvatarFallback } from "@goat-format-chatbot/design-system/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@goat-format-chatbot/design-system/components/ui/dropdown-menu";
import {
  RiComputerLine,
  RiExpandUpDownLine,
  RiMoonLine,
  RiSunLine,
  RiUserLine,
} from "@remixicon/react";
import type { ReactNode } from "react";

import { parseTheme, setTheme, useTheme, type Theme } from "@/features/settings/hooks/use-theme";

const themeOptions: { theme: Theme; label: string; icon: ReactNode }[] = [
  { theme: "system", label: "System", icon: <RiComputerLine /> },
  { theme: "light", label: "Light", icon: <RiSunLine /> },
  { theme: "dark", label: "Dark", icon: <RiMoonLine /> },
];

function Identity() {
  return (
    <>
      <Avatar>
        <AvatarFallback>
          <RiUserLine className="size-4" />
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium text-foreground">You</span>
        <span className="truncate text-xs text-muted-foreground">Local</span>
      </div>
    </>
  );
}

export function UserMenu() {
  const theme = useTheme();
  const { isMobile, state } = useSidebar();
  const beside = state === "collapsed" && !isMobile;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                tooltip="You"
                className="h-12 px-1 data-popup-open:bg-sidebar-accent"
              />
            }
          >
            <Identity />
            <RiExpandUpDownLine className="mr-2 ml-auto text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={beside ? "right" : "top"}
            align={beside ? "end" : "start"}
            sideOffset={4}
            className="w-(--anchor-width) min-w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2.5 px-1 py-1.5">
                <Identity />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex items-center justify-between gap-2 py-1 pr-1 pl-2">
              <DropdownMenuLabel className="p-0 text-sm text-foreground">Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(parseTheme(value))}
                className="flex gap-0.5 rounded-full bg-accent p-0.5"
              >
                {themeOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.theme}
                    value={option.theme}
                    aria-label={option.label}
                    className="size-7 min-h-0 justify-center rounded-full p-0 text-muted-foreground focus:bg-transparent data-checked:bg-background data-checked:text-foreground data-checked:shadow-xs data-checked:ring-1 data-checked:ring-border data-checked:focus:bg-background [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden"
                  >
                    {option.icon}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
