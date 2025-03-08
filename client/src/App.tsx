import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { Suspense, lazy, Component, ReactNode } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";

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

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-xl font-semibold text-destructive">Oops! Something went wrong.</p>
          <p className="text-sm text-muted-foreground mb-4">Please try reloading the page.</p>
          <Button onClick={this.handleRetry} variant="outline">
            Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Layout>
        <Switch>
          <Route path="/auth" component={Auth} />
          <Route path="/pricing" component={Pricing} />
          <ProtectedRoute path="/" component={Home} />
          <ProtectedRoute path="/explore" component={Explore} />
          <ProtectedRoute path="/events" component={Events} />
          <ProtectedRoute path="/quiz" component={TravelQuiz} />
          <ProtectedRoute path="/plan" component={Plan} />
          <ProtectedRoute path="/profile" component={Profile} />
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
        <ErrorBoundary>
          <div className="min-h-screen bg-background text-foreground">
            <AppContent />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}
