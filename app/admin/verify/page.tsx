"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyAdminMagicLink } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setToken } = useAdminAuth();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing link token");
      return;
    }
    verifyAdminMagicLink(token)
      .then((res) => {
        setToken(res.token);
        setStatus("ok");
        router.replace("/admin");
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Invalid or expired link");
      });
  }, [searchParams, setToken, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cream-200">Signing you in…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-red-300 mb-4">{message}</p>
        <a href="/admin/login" className="text-cream-50 underline">
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-cream-200">Redirecting…</p>
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-cream-200">Loading…</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
