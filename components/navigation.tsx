"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Mail, Target, Home, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Mwanzo", icon: Home },
  { href: "/resume", label: "CV", icon: FileText },
  { href: "/letter", label: "Barua", icon: Mail },
  { href: "/match", label: "Linganisha", icon: Target },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/70 glass sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <FileText className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-xl gradient-title tracking-tight">JobKit Pro</span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" /> Beta
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors animate-fadeIn",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <div className="ml-1 pl-2 border-l border-border">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
