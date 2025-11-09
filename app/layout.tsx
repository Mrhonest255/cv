import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JobKit Pro - Smart Resume & Cover Letter Builder",
  description: "Offline-first resume builder with AI-powered cover letters using Gemini API",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JobKit Pro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw" suppressHydrationWarning>
      <head>
        {/* Init theme prior to paint to avoid FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const ls = localStorage.getItem('theme');
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const shouldDark = ls ? ls === 'dark' : mql.matches;
    const root = document.documentElement;
    if (shouldDark) root.classList.add('dark');
  } catch {}
})();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] blur-3xl opacity-40 bg-gradient-radial from-indigo-400/40 via-purple-400/30 to-transparent" />
        </div>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
