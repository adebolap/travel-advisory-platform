import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/ui/navigation";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/home"));
const ExplorePage = lazy(() => import("@/pages/explore"));
const EventsPage = lazy(() => import("@/pages/events"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const TravelQuizPage = lazy(() => import("@/pages/travel-quiz"));
const PricingPage = lazy(() => import("@/pages/pricing"));
const ChatPage = lazy(() => import("@/pages/chat"));

// Component wrappers to fix lazy loading issue
const Home = () => <HomePage />;
const Explore = () => <ExplorePage />;
const Events = () => <EventsPage />;
const Profile = () => <ProfilePage />;
const NotFound = () => <NotFoundPage />;
const Auth = () => <AuthPage />;
const TravelQuiz = () => <TravelQuizPage />;
const Pricing = () => <PricingPage />;
const Chat = () => <ChatPage />;

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
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Suspense fallback={<LoadingSpinner />}>
              <Switch>
                <Route path="/auth" component={Auth} />
                <Route path="/pricing" component={Pricing} />
                <Route path="/profile" component={Profile} />
                <Route path="/chat" component={Chat} />
                <ProtectedRoute path="/" component={Home} />
                <ProtectedRoute path="/explore" component={Explore} />
                <ProtectedRoute path="/events" component={Events} />
                <ProtectedRoute path="/quiz" component={TravelQuiz} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}