"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import AppSidebar from "../components/sidebar/Sidebar";
import Header from "./header/Header";
import DashboardAuthGuard from "../components/DashboardAuthGuard";
import { ModalManager } from "../components/ModalManager"; // Add this import

export default function ClientWrapper({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <DashboardAuthGuard>
          <ModalManager />
          <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
        </DashboardAuthGuard>
      </SidebarInset>
    </SidebarProvider>
  );
}
