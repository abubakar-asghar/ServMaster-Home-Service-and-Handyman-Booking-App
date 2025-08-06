"use client";

import {
  Calendar,
  SquareKanban,
  UserRoundCog,
  SlidersHorizontal,
  Bolt,
  Shield,
  Flag,
  ClipboardCheck,
  ShieldX,
  Home,
  ChartNoAxesCombined,
  MessageCircleMore,
  BookOpenText,
  ShieldUser,
  UserRound,
  UserRoundPen,
  LayoutList,
  ShieldEllipsis,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "../../components/ui/sidebar";
import { NavAdministrative } from "./NavAdministrative";
import { NavMenu } from "./NavMenu";

const items = {
  dashboard: {
    title: "Dashboard",
    subMenu: [
      { title: "Overview", url: "/dashboard/overview", icon: SquareKanban },
      {
        title: "Statistics",
        url: "/dashboard/statistics",
        icon: ChartNoAxesCombined,
      },
      // {
      //   title: "Recent Activities",
      //   url: "/dashboard/recent-activities",
      //   icon: MonitorStop,
      // },
    ],
  },
  administratives: [
    {
      title: "Customers Management",
      icon: UserRound,
      items: [
        { title: "View All Customers", url: "/dashboard/customers/all" },
        // { title: "Customer Details", url: "/dashboard/customers/detail" },
        // {
        //   title: "Block/Unblock Customer",
        //   url: "/dashboard/customers/block-unblock",
        // },
      ],
    },
    {
      title: "Providers Management",
      icon: UserRoundCog,
      items: [
        {
          title: "View All Service Providers",
          url: "/dashboard/service-providers/all",
        },
        // {
        //   title: "Verify Service Providers",
        //   url: "/dashboard/service-providers/verify",
        // },
        // {
        //   title: "Block/Unblock Providers",
        //   url: "/dashboard/service-providers/block-unblock",
        // },
        // {
        //   title: "Assign/Manage Services",
        //   url: "/dashboard/service-providers/manage",
        // },
      ],
    },
    // {
    //   title: "Bookings Management",
    //   icon: Calendar,
    //   items: [
    //     { title: "All Bookings", url: "/dashboard/bookings/all" },
    //     { title: "Pending Bookings", url: "/dashboard/bookings/pending" },
    //     { title: "Ongoing Bookings", url: "/dashboard/bookings/ongoing" },
    //     { title: "Completed Bookings", url: "/dashboard/bookings/completed" },
    //     { title: "Cancelled Bookings", url: "/dashboard/bookings/cancelled" },
    //   ],
    // },
    // {
    //   title: "Chat Management",
    //   icon: MessageCircleMore,
    //   items: [
    //     { title: "View All Chats", url: "/dashboard/chats/all" },
    //     { title: "Reported Chats", url: "/dashboard/chats/reported" },
    //   ],
    // },
    // {
    //   title: "Reviews & Ratings",
    //   icon: BookOpenText,
    //   items: [
    //     { title: "View All Reviews", url: "/dashboard/reviews-ratings/all" },
    //     {
    //       title: "Reported Reviews",
    //       url: "/dashboard/reviews-ratings/reported",
    //     },
    //   ],
    // },
    {
      title: "Services Management",
      icon: LayoutList,
      items: [
        {
          title: "Manage Service Categories",
          url: "/dashboard/service-categories",
        },
        {
          title: "Manage Services",
          url: "/dashboard/services",
        },
      ],
    },
    // {
    //   title: "Admins Management",
    //   icon: ShieldUser || ShieldEllipsis || ShieldX,
    //   items: [
    //     { title: "View All Admins", url: "/dashboard/admins/all" },
    //     { title: "Add New Admin", url: "/dashboard/admins/add" },
    //     { title: "Edit Admin Details", url: "/dashboard/admins/edit" },
    //     { title: "Delete Admin", url: "/dashboard/admins/delete" },
    //   ],
    // },
  ],
  // reportcomplaints: {
  //   title: "Reports & Complaints",
  //   subMenu: [
  //     {
  //       title: "View Reports",
  //       url: "/dashboard/reports-complaints/view",
  //       icon: Flag,
  //     },
  //     {
  //       title: "Resolve Complaints",
  //       url: "/dashboard/reports-complaints/resolve",
  //       icon: ClipboardCheck,
  //     },
  //   ],
  // },
  // settings: {
  //   title: "Settings",
  //   subMenu: [
  //     {
  //       title: "General Settings",
  //       url: "/dashboard/settings/general",
  //       icon: SlidersHorizontal,
  //     },
  //     {
  //       title: "Manage Roles & Permissions",
  //       url: "/dashboard/settings/manage-role-permissions",
  //       icon: UserRoundPen,
  //     },
  //     {
  //       title: "System Configurations",
  //       url: "/dashboard/settings/system-configurations",
  //       icon: Bolt,
  //     },
  //     {
  //       title: "Authentication & Security",
  //       url: "/dashboard/settings/authentication-n-security",
  //       icon: Shield,
  //     },
  //   ],
  // },
  // admin: {
  //   title: "Admin",
  //   subMenu: [
  //     { title: "All Admins", url: "#", icon: ShieldUser || ShieldEllipsis || ShieldX },
  //     { title: "Account", url: "#", icon: SquareUserRound },
  //     { title: "Change Password", url: "#", icon: KeyRound },
  //   ],
  // },
};

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex-row items-center">
        <div className="flex items-center px-2 gap-2">
          <Home className="h-4 w-4" />
          <span className="text-lg font-semibold">ServMaster</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMenu item={items.dashboard} />
        <NavAdministrative items={items.administratives} />
        {/* <NavMenu item={items.reportcomplaints} /> */}
        {/* <NavMenu item={items.settings} /> */}
        {/* <NavMenu item={items.admin} /> */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
