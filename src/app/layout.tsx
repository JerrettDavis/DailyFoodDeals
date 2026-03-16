import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { canUseRuntimeAuth } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: "DailyFoodDeals - Sizzling Deals Near You",
  description: "Sizzling snacks and daily deals that won't break the bank",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen flex flex-col font-sans">
        <SessionProvider enabled={canUseRuntimeAuth}>
          <Header authEnabled={canUseRuntimeAuth} />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
