import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/ui/navigation";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const Explore = lazy(() => import("@/pages/explore"));
const Events = lazy(() => import("@/pages/events"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Auth = lazy(() => import("@/pages/auth-page"));
const TravelQuiz = lazy(() => import("@/pages/travel-quiz"));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/auth" component={Auth} />
              <ProtectedRoute path="/" component={Home} />
              <ProtectedRoute path="/explore" component={Explore} />
              <ProtectedRoute path="/events" component={Events} />
              <ProtectedRoute path="/quiz" component={TravelQuiz} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}