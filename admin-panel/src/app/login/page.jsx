"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../lib/validations";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { useAdminLogin } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "../../lib/storage";
import { Spinner } from "../../components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../components/ui/form";
import Link from "next/link";
import { Eye, EyeOff, GalleryVerticalEnd, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: adminLogin, isPending } = useAdminLogin();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await adminLogin(data);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/dashboard/overview");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={"large"}>Please wait...</Spinner>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Form {...form}>
        <form
          className={"flex flex-col gap-6 m-auto"}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              {/* <Link
                href="/login"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">ServMaster Admin Panel</span>
              </Link> */}
              <h1 className="text-xl font-bold">Welcome to ServMaster</h1>
              <div className="text-center text-sm text-gray-500 dark:text-dark-text-muted">
                Enter your credentials below to continue
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="email" className="font-semibold">
                            Email
                          </Label>
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <Label htmlFor="password" className="font-semibold">
                              Password
                            </Label>
                            <Link
                              href="/forgot-password"
                              className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                              Forgot your password?
                            </Link>
                          </div>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-2 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging
                  in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
