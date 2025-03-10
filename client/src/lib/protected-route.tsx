import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  requireAuth?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  requireAuth = false,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (requireAuth && !isAuthenticated) {
          return <Redirect to="/auth" />;
        }

        return <Component {...params} />;
      }}
    </Route>
  );
}