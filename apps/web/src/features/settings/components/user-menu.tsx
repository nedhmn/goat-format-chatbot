import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@goat-format-chatbot/design-system/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@goat-format-chatbot/design-system/components/ui/dropdown-menu";
import { RiComputerLine, RiMoonLine, RiSunLine, RiUserLine } from "@remixicon/react";
import type { ReactNode } from "react";

import { parseTheme, setTheme, useTheme, type Theme } from "@/features/settings/hooks/use-theme";

const themeOptions: { theme: Theme; label: string; icon: ReactNode }[] = [
  { theme: "system", label: "System", icon: <RiComputerLine /> },
  { theme: "light", label: "Light", icon: <RiSunLine /> },
  { theme: "dark", label: "Dark", icon: <RiMoonLine /> },
];

export function UserMenu() {
  const theme = useTheme();
  const { isMobile, state } = useSidebar();
  const beside = state === "collapsed" && !isMobile;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton tooltip="You" />}>
            <RiUserLine />
            <span>You</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={beside ? "right" : "top"}
            align={beside ? "end" : "start"}
            className="w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(parseTheme(value))}
              >
                {themeOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.theme} value={option.theme}>
                    {option.icon}
                    {option.label}
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
