"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
    } else {
      router.replace("/dashboard/overview");
    }
  }, [router]);

  return null;
}
