"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, isLoading } = useAdminAuth();

  const isPublic = pathname === "/admin/login" || pathname === "/admin/verify";

  useEffect(() => {
    if (isLoading) return;
    if (!isPublic && !token) {
      router.replace("/admin/login");
    }
  }, [isLoading, token, isPublic, router]);

  if (isLoading && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cream-200">Loading...</p>
      </div>
    );
  }

  if (!isPublic && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cream-200">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
