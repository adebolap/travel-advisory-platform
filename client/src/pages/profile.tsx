import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarPlus, MapPin, Calendar as CalendarIcon } from "lucide-react";
import CalendarIntegration from "@/components/calendar-integration";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();

  const { data: trips } = useQuery({
    queryKey: ["/api/trips"],
    enabled: !!user, // Only fetch trips if user is logged in
  });

  // Show login/signup prompt for non-authenticated users
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to Travel Companion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Sign in to access your personalized travel profile, save trips, and get customized recommendations.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/auth?mode=login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth?mode=register">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* User Profile Section */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Username</h3>
                  <p className="text-muted-foreground">{user.username}</p>
                </div>
                {user.travelStyle && (
                  <div>
                    <h3 className="font-medium">Travel Style</h3>
                    <p className="text-muted-foreground capitalize">{user.travelStyle}</p>
                  </div>
                )}
                {user.preferredActivities && user.preferredActivities.length > 0 && (
                  <div>
                    <h3 className="font-medium">Preferred Activities</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.preferredActivities.map((activity) => (
                        <span key={activity} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/travel-quiz">Complete Travel Quiz</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trips Section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {!trips?.length ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No trips planned yet!</p>
                  <Button asChild>
                    <Link href="/explore">Plan a Trip</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {trips.map((trip) => (
                    <Card key={trip.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{trip.title}</h3>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1" />
                              {trip.city}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {format(new Date(trip.startDate), "MMM d, yyyy")}
                            </div>
                            <div>to {format(new Date(trip.endDate), "MMM d, yyyy")}</div>
                          </div>
                        </div>
                        {trip.description && (
                          <p className="text-muted-foreground mb-4">{trip.description}</p>
                        )}
                        <CalendarIntegration
                          event={{
                            id: trip.id,
                            name: trip.title,
                            description: trip.description || `Trip to ${trip.city}`,
                            date: trip.startDate,
                            endDate: trip.endDate,
                            location: trip.city,
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}