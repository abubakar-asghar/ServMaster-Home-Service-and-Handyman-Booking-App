"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "../../lib/storage";
import { useIsAuthenticated } from "../../hooks/useAuth";
import { Spinner } from "../ui/spinner";

export default function AuthGuard({ children, authConfig }) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutateAsync: checkAuth } = useIsAuthenticated();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = getToken();

      // If route requires authentication but no token exists
      if (authConfig?.required && !token) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // If route is for authenticated users
      if (authConfig?.required) {
        try {
          await checkAuth();
        } catch (error) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
      }

      // If user is logged in but tries to access auth routes (login/register)
      if (authConfig?.redirectIfAuthenticated && token) {
        router.replace(authConfig.redirectPath || "/dashboard");
        return;
      }

      setLoading(false);
    };

    verifyUser();
  }, [checkAuth, router, pathname, authConfig]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <Spinner size="large">Authenticating...</Spinner>
      </div>
    );
  }

  return <>{children}</>;
}
