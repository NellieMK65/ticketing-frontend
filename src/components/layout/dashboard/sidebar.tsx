import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../../ui/sidebar";
import { Home } from "@hugeicons/core-free-icons";

type Items = {
  title: string;
  url: string;
  icon: IconSvgElement;
  isActive?: boolean;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems: Items[] = [
    {
      icon: Home,
      url: "/dashboard",
      title: "Dashboard",
    },
  ];

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <div>Event Hub</div>
        <NavMain items={navItems} />
      </SidebarHeader>

      <SidebarRail />
    </Sidebar>
  );
}

export function NavMain({ items }: { items: Items[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive}>
            <a href={item.url}>
              <HugeiconsIcon icon={item.icon} />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
