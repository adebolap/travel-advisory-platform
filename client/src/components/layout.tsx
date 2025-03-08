import { ReactNode } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { motion } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-gradient-to-b from-white to-gray-100">
      {/* Header with enhanced visuals */}
      {(title || subtitle) && (
        <motion.header 
          className="px-4 py-6 space-y-1 border-b bg-background/80 backdrop-blur-lg shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {title && (
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </motion.header>
      )}

      {/* Main content with animation */}
      <motion.main 
        className="container max-w-screen-xl mx-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {children}
      </motion.main>

      {/* Bottom navigation on mobile with smooth transition */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <BottomNav />
      </motion.div>
    </div>
  );
}
