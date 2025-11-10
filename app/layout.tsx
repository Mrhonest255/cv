import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/navigation";
import Particles from "@/components/visual/Particles";

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
      <body className={`${inter.className} min-h-screen relative overflow-hidden text-slate-100 bg-animated-gradient`}>
        {/* Skip to content link for accessibility */}
        <a href="#main" className="skip-link">Ruka kwenye maudhui</a>
        {/* Floating particles background */}
        <Particles count={35} />
        {/* Subtle vignette overlay */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.6))]" />
        <Navigation />
        <main id="main" className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
