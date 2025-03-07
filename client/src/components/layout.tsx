import { ReactNode } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Header with improved typography */}
      {(title || subtitle) && (
        <header className="px-4 py-6 space-y-1 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </header>
      )}

      {/* Main content */}
      <main className="container max-w-screen-xl mx-auto p-4">
        {children}
      </main>

      {/* Bottom navigation on mobile */}
      <BottomNav />
    </div>
  );
}
