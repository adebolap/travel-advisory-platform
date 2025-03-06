import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, Globe, Home, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="flex items-center gap-2 font-semibold text-xl">
                <Plane className="h-6 w-6 text-primary" />
                <span>TravelTime</span>
              </a>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant={location === "/" ? "default" : "ghost"}>
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant={location === "/explore" ? "default" : "ghost"}>
                  <Globe className="h-4 w-4 mr-2" />
                  Explore
                </Button>
              </Link>
              <Link href="/events">
                <Button variant={location === "/events" ? "default" : "ghost"}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              user.isSubscribed ? (
                <span className="text-sm text-muted-foreground">Premium Member</span>
              ) : (
                <Link href="/pricing">
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
              )
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}