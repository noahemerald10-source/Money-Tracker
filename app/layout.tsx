import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // enables env(safe-area-inset-*) in standalone mode
};

export const metadata: Metadata = {
  title: "MoneyTrack - Finance Dashboard",
  description: "Personal finance tracker",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MoneyTrack",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased`}>
          <div
            className="flex overflow-hidden bg-background"
            style={{
              height: "100dvh",
              paddingTop: "env(safe-area-inset-top)",
            }}
          >
            <Sidebar />
            <main className="flex-1 overflow-y-auto overscroll-none bg-background pwa-main-scroll">
              {children}
            </main>
            <Toaster />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
