import {
  Calendar,
  MonitorStop,
  Inbox,
  Search,
  SquareKanban,
  ChartNoAxesCombined,
  ChevronDown,
  SquareUser,
  KeyRound,
  LogOut,
  UserRoundCog,
  SlidersHorizontal,
  Bolt,
  Shield,
  Flag,
  ClipboardCheck,
  SquareMenu,
  Logs,
  MessageSquareDiff,
  MessageSquareWarning,
  ShieldX,
  BookUser,
  BookmarkCheck,
  SquareUserRound,
  BookCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Sidebar sub components
const SidebarMenuSub = SidebarMenu;
const SidebarMenuSubItem = SidebarMenuItem;

// Menu items
const items = [
  {
    title: "Dashboard",
    subMenu: [
      { title: "Overview", url: "#", icon: SquareKanban },
      { title: "Statistics", url: "#", icon: ChartNoAxesCombined },
      { title: "Recent Activities", url: "#", icon: MonitorStop },
    ],
  },
  {
    title: "Customers Management",
    subMenu: [
      { title: "View All Customers", url: "#", icon: SquareUserRound },
      { title: "Customer Details", url: "#", icon: BookUser },
      { title: "Block/Unblock Customer", url: "#", icon: ShieldX },
    ],
  },
  {
    title: "Service Providers Management",
    subMenu: [
      { title: "Verify Service Providers", url: "#", icon: BookCheck },
      { title: "View All Service Providers", url: "#", icon: BookUser },
      { title: "Block/Unblock Providers", url: "#", icon: ShieldX },
      { title: "Assign/Manage Services", url: "#", icon: BookmarkCheck },
    ],
  },
  {
    title: "Service Requests",
    subMenu: [
      { title: "All Requests", url: "#", icon: Inbox },
      { title: "Pending Requests", url: "#", icon: Calendar },
      { title: "Ongoing Requests", url: "#", icon: MonitorStop },
      { title: "Completed Requests", url: "#", icon: SquareKanban },
      { title: "Cancelled Requests", url: "#", icon: Calendar },
    ],
  },
  {
    title: "Chat Management",
    subMenu: [
      { title: "View All Chats", url: "#", icon: Inbox },
      { title: "Reported Chats", url: "#", icon: MessageSquareWarning },
    ],
  },
  {
    title: "Reviews & Ratings",
    subMenu: [
      { title: "View All Reviews", url: "#", icon: MessageSquareDiff },
      { title: "Reported Reviews", url: "#", icon: MessageSquareWarning },
    ],
  },
  {
    title: "Service Categories & Subservices",
    subMenu: [
      { title: "Manage Service Categories", url: "#", icon: SquareMenu },
      { title: "Manage Subservices", url: "#", icon: Logs },
    ],
  },
  {
    title: "Reports & Complaints",
    subMenu: [
      { title: "View Reports", url: "#", icon: Flag },
      { title: "Resolve Complaints", url: "#", icon: ClipboardCheck },
    ],
  },
  {
    title: "Settings",
    subMenu: [
      { title: "General Settings", url: "#", icon: SlidersHorizontal },
      { title: "Manage Roles & Permissions", url: "#", icon: UserRoundCog },
      { title: "System Configurations", url: "#", icon: Bolt },
      { title: "Authentication & Security", url: "#", icon: Shield },
    ],
  },
  {
    title: "Admin",
    subMenu: [
      { title: "Admin Profile", url: "#", icon: SquareUser },
      { title: "Change Password", url: "#", icon: KeyRound },
      { title: "Logout", url: "#", icon: LogOut },
    ],
  },
];

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        {/* <SidebarMenu>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                Help
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                <SidebarMenuButton />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem />
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu> */}
        {items.map((menu) => (
          <SidebarGroup key={menu.title}>
            <SidebarGroupLabel>{menu.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menu.subMenu.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
