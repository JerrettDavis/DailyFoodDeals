import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
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
      <body className="min-h-screen bg-gray-950 font-sans text-white antialiased">
        <SessionProvider enabled={canUseRuntimeAuth}>
          <div className="relative flex min-h-screen flex-col">
            <Header authEnabled={canUseRuntimeAuth} />
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
