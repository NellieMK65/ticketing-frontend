import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../../ui/sidebar";
import { Calendar, Home, UserAccountIcon } from "@hugeicons/core-free-icons";
import { Link, useLocation } from "react-router";

type Items = {
  title: string;
  url: string;
  icon: IconSvgElement;
  isActive?: boolean;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();

  const navItems: Items[] = [
    {
      icon: Home,
      url: "/dashboard",
      title: "Dashboard",
      isActive: pathname == "/dashboard",
    },
    {
      icon: Calendar,
      url: "/dashboard/events",
      title: "Events",
      isActive: pathname == "/dashboard/events",
    },
    {
      icon: UserAccountIcon,
      url: "/dashboard/users",
      title: "Users",
      isActive: pathname == "/dashboard/users",
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
            <Link to={item.url}>
              <HugeiconsIcon icon={item.icon} />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
