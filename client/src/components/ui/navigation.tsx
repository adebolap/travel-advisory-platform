import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plane, Calendar, Globe, Home, CreditCard, 
  User, MessageSquare, Menu, X 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center gap-2 font-semibold text-xl">
                <Plane className="h-6 w-6 text-primary" />
                <span>TravelTime</span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/">
              <Button variant={location === "/" ? "default" : "ghost"} size="sm">
                <Home className="h-4 w-4 mr-2" />
                <span>Home</span>
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant={location === "/explore" ? "default" : "ghost"} size="sm">
                <Globe className="h-4 w-4 mr-2" />
                <span>Explore</span>
              </Button>
            </Link>
            <Link href="/events">
              <Button variant={location === "/events" ? "default" : "ghost"} size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Events</span>
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant={location === "/chat" ? "default" : "ghost"} size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Chat</span>
              </Button>
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Link href="/profile">
                <Button variant={location === "/profile" ? "default" : "ghost"} size="sm">
                  <User className="h-4 w-4 mr-2" />
                  <span>Profile</span>
                </Button>
              </Link>
              {user ? (
                user.isSubscribed ? (
                  <span className="text-sm text-muted-foreground">Premium Member</span>
                ) : (
                  <Link href="/pricing">
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Upgrade to Premium</span>
                      <span className="sm:hidden">Upgrade</span>
                    </Button>
                  </Link>
                )
              ) : (
                <Link href="/auth">
                  <Button variant="default" size="sm">Sign In</Button>
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link href="/">
                <Button 
                  variant={location === "/" ? "default" : "ghost"} 
                  className="justify-start w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/explore">
                <Button 
                  variant={location === "/explore" ? "default" : "ghost"} 
                  className="justify-start w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Explore
                </Button>
              </Link>
              <Link href="/events">
                <Button 
                  variant={location === "/events" ? "default" : "ghost"} 
                  className="justify-start w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Button>
              </Link>
              <Link href="/chat">
                <Button 
                  variant={location === "/chat" ? "default" : "ghost"} 
                  className="justify-start w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
              <Link href="/profile">
                <Button 
                  variant={location === "/profile" ? "default" : "ghost"} 
                  className="justify-start w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {user ? (
                user.isSubscribed ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Premium Member
                  </div>
                ) : (
                  <Link href="/pricing">
                    <Button 
                      variant="outline" 
                      className="justify-start w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                )
              ) : (
                <Link href="/auth">
                  <Button 
                    variant="default"
                    className="justify-start w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}