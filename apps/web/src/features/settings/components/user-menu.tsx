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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@goat-format-chatbot/design-system/components/ui/dropdown-menu";
import { RiMoreLine, RiSettings3Line, RiUserLine } from "@remixicon/react";

import { parseTheme, setTheme, useTheme, type Theme } from "@/features/settings/hooks/use-theme";

const themeOptions: { theme: Theme; label: string }[] = [
  { theme: "system", label: "System" },
  { theme: "light", label: "Light" },
  { theme: "dark", label: "Dark" },
];

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
                className="h-11 px-1 data-popup-open:bg-sidebar-accent"
              />
            }
          >
            <Avatar>
              <AvatarFallback>
                <RiUserLine className="size-4" />
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate font-medium">You</span>
            <RiMoreLine className="mr-2 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={beside ? "right" : "top"}
            align={beside ? "end" : "start"}
            sideOffset={6}
            className="w-(--anchor-width) min-w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col px-2 py-1.5">
                <span className="text-sm font-medium text-foreground">You</span>
                <span>Local</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <RiSettings3Line />
                Preferences
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(parseTheme(value))}
                  >
                    {themeOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.theme} value={option.theme}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
