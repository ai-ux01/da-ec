import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminGate } from "@/components/admin/AdminGate";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — AMRYTUM",
  description: "Admin panel for AMRYTUM",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-earth-600 text-cream-50">
        <AdminGate>{children}</AdminGate>
      </div>
    </AdminAuthProvider>
  );
}
