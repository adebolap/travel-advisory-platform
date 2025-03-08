import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { motion } from "framer-motion";

export function ProtectedRoute({
  path,
  component: Component,
  requireAuth = false,
}: {
  path: string;
  component: React.ComponentType;
  requireAuth?: boolean;
}) {
  const { user, isLoading, isGuest } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Only redirect to auth if the route requires authentication and user is not logged in
  if (requireAuth && !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Allow access to both authenticated users and guests
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