import { Loader2 } from "lucide-react";
import { Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({
  path,
  component: Component,
  requireAuth = false,
}: {
  path: string;
  component: React.ComponentType;
  requireAuth?: boolean;
}) {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requireAuth && !isAuthenticated ? (
        window.location.href = "/auth"
      ) : (
        <Component />
      )}
    </Route>
  );
}