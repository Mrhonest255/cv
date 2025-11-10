"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Mail, Target, Home, Sparkles, MessageSquare, Menu, Smartphone } from "lucide-react";
import React from 'react';
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Mwanzo", icon: Home },
  { href: "/resume", label: "CV", icon: FileText },
  { href: "/letter", label: "Barua", icon: Mail },
  { href: "/match", label: "Linganisha", icon: Target },
  { href: "/ai-chat", label: "AI Chat", icon: MessageSquare },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { forceMobile, toggleForceMobile, setForceMobile } = useAppStore();

  // Hydrate forceMobile from localStorage once
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('forceMobile');
      if (raw === '1') setForceMobile(true);
    } catch {}
  }, [setForceMobile]);

  return (
    <nav className="border-b bg-background/70 glass backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="JobKit Pro Home">
            <FileText className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xl gradient-title tracking-tight">JobKit Pro</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" /> Beta
            </span>
          </Link>

          {/* Desktop nav */}
          <div className={cn(forceMobile ? 'hidden' : 'hidden md:flex', 'items-center space-x-1')} aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="ml-2 pl-2 border-l border-border">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleForceMobile}
              aria-label={forceMobile ? 'Zima Mobile Mode' : 'Washa Mobile Mode'}
              className={cn('p-2 rounded-md border border-border bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary transition-colors', forceMobile && 'bg-primary text-primary-foreground')}
            >
              <Smartphone className="h-5 w-5" />
            </button>
            <button
              onClick={() => setOpen(o => !o)}
              aria-label="Fungua menyu"
              aria-expanded={open}
              className="p-2 rounded-md border border-border bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Mobile panel */}
        {(open || forceMobile) && (
          <div className="md:hidden animate-fadeIn pb-4" role="menu" aria-label="Menyu ya simu">
            <div className="grid gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium border",
                      isActive ? "bg-primary text-primary-foreground border-primary" : "bg-card/70 hover:bg-accent text-muted-foreground"
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={toggleForceMobile}
                className={cn('px-3 py-2 rounded-md text-sm font-medium border', forceMobile ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent text-muted-foreground')}
              >
                {forceMobile ? 'Ondoa Mobile Mode' : 'Weka Mobile Mode'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
