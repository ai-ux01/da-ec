import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "AMRYTUM — A2 Desi Cow Ghee",
  description:
    "Small batch A2 desi cow ghee made using the bilona method. From farm to jar. No shortcuts.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden w-full">
        <CartProvider>
          <Header />
          <main className="flex-1 w-full min-w-0">
          <div className="w-full min-w-0 overflow-x-hidden">{children}</div>
        </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
