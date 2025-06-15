"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/Sidebar";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { Spinner } from "./ui/spinner";
import Header from "./header/Header";

export default function ClientWrapper({ children }) {
  const router = useRouter();
  const { mutateAsync: checkAuth, isPending } = useIsAuthenticated();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const setAuthUser = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      await checkAuth();
      setLoading(false);
    };
    setAuthUser();
  }, [checkAuth, router]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={"large"}>Please wait...</Spinner>
      </div>
    );
  else
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
}
