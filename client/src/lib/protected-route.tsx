import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export function ProtectedRoute({
  path,
  component: Component,
  requireAuth = false,
}: {
  path: string;
  component: React.ComponentType;
  requireAuth?: boolean;
}) {
  const { user, isLoading, error } = useAuth();

  // Check guest session status
  const { data: guestStatus, isLoading: guestLoading } = useQuery({
    queryKey: ['/api/guest-status'],
    refetchInterval: 60000, // Check every minute
  });

  if (isLoading || guestLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Handle auth-required routes
  if (requireAuth && !user && !guestStatus) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // For non-auth-required routes, allow access or if guestStatus is true
  return (
    <Route path={path}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Component />
      </motion.div>
    </Route>
  );
}