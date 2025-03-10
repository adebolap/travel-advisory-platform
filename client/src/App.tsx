import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/lib/protected-route";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const Explore = lazy(() => import("@/pages/explore"));
const Events = lazy(() => import("@/pages/events"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Auth = lazy(() => import("@/pages/auth-page"));
const TravelQuiz = lazy(() => import("@/pages/travel-quiz"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Plan = lazy(() => import("@/pages/plan"));
const Profile = lazy(() => import("@/pages/profile"));

function LoadingSpinner() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground">Loading content, please wait...</p>
    </div>
  );
}

function AppContent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Layout>
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          <Route path="/explore" component={Explore} />
          <Route path="/events" component={Events} />
          <Route path="/auth" component={Auth} />
          <Route path="/pricing" component={Pricing} />

          {/* Protected routes */}
          <ProtectedRoute path="/profile" component={Profile} requireAuth />
          <ProtectedRoute path="/quiz" component={TravelQuiz} requireAuth />
          <ProtectedRoute path="/plan" component={Plan} requireAuth />

          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground antialiased">
          <AppContent />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}