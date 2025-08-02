"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../lib/storage";
import { useIsAuthenticated } from "../hooks/useAuth";
import { Spinner } from "./ui/spinner";

export default function DashboardAuthGuard({ children }) {
  const router = useRouter();
  const { mutateAsync: checkAuth } = useIsAuthenticated();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        await checkAuth();
      } catch (e) {
        router.replace("/login");
        return;
      }
      setLoading(false);
    };
    verifyUser();
  }, [checkAuth, router]);

  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="large">Please wait...</Spinner>
      </div>
    );

  return <>{children}</>;
}
