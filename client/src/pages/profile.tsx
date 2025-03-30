import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { 
  CalendarPlus, MapPin, Calendar as CalendarIcon, 
  Share2, Globe, User, Lock, Check, 
  Globe2, BadgeCheck 
} from "lucide-react";
import CalendarIntegration from "@/components/calendar-integration";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get authenticated user's trips if logged in
  const { data: userTrips = [], isLoading: isUserTripsLoading } = useQuery({
    queryKey: ["/api/trips"],
    enabled: !!user, // Only fetch user trips if logged in
  });

  // Get public/featured trips regardless of authentication status
  const { data: publicTrips = [], isLoading: isPublicTripsLoading } = useQuery({
    queryKey: ["/api/public-trips"],
  });

  // Mutation to toggle trip sharing status
  const toggleShareMutation = useMutation({
    mutationFn: async (tripId: number) => {
      const response = await fetch(`/api/trips/${tripId}/toggle-share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update trip sharing status');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update the cache for both personal trips and public trips
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public-trips"] });
      
      toast({
        title: data.isShared ? "Trip shared" : "Trip now private",
        description: data.message,
        variant: data.isShared ? "default" : "secondary",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating trip",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const renderTripCard = (trip: any, showShareButton = false) => (
    <Card key={trip.id} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{trip.title}</h3>
              {trip.isShared && (
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />
                  Public
                </span>
              )}
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {trip.city}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {format(new Date(trip.startDate), "MMM d, yyyy")}
              </div>
              <div>to {format(new Date(trip.endDate), "MMM d, yyyy")}</div>
            </div>
            {showShareButton && (
              <Button 
                variant={trip.isShared ? "default" : "outline"}
                size="sm" 
                className={`h-8 w-8 p-0 ${trip.isShared ? 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30' : ''}`}
                title={trip.isShared ? "Trip is public - Click to make private" : "Share Trip Publicly"}
                disabled={toggleShareMutation.isPending}
                onClick={() => {
                  toggleShareMutation.mutate(trip.id);
                }}
              >
                {toggleShareMutation.isPending && toggleShareMutation.variables === trip.id ? (
                  <div className="h-4 w-4 rounded-full animate-spin border-2 border-primary border-t-transparent" />
                ) : trip.isShared ? (
                  <BadgeCheck className="h-4 w-4" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </Button>
            )}
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
  );

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
              {user ? (
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
                    <Link href="/quiz">Complete Travel Quiz</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Create an account to personalize your travel experience and save your preferences.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href="/auth?mode=login">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth?mode=register">Register</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trips Section with Tabs */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Trip Collections</CardTitle>
              <CardDescription>
                Explore trips created by our community or {!user && "sign in to "} manage your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={user ? "my-trips" : "featured"}>
                <TabsList className="mb-4">
                  {user && <TabsTrigger value="my-trips">My Trips</TabsTrigger>}
                  <TabsTrigger value="featured">Featured Trips</TabsTrigger>
                </TabsList>
                
                {user && (
                  <TabsContent value="my-trips" className="space-y-4">
                    {isUserTripsLoading ? (
                      <div className="text-center py-6">
                        <div className="animate-spin h-6 w-6 rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading your trips...</p>
                      </div>
                    ) : !userTrips?.length ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No trips planned yet!</p>
                        <Button asChild>
                          <Link href="/explore">Plan a Trip</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {userTrips.map(trip => renderTripCard(trip, true))}
                      </div>
                    )}
                  </TabsContent>
                )}
                
                <TabsContent value="featured" className="space-y-4">
                  {isPublicTripsLoading ? (
                    <div className="text-center py-6">
                      <div className="animate-spin h-6 w-6 rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading featured trips...</p>
                    </div>
                  ) : !publicTrips?.length ? (
                    <div className="text-center py-8 space-y-4">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto opacity-40" />
                      <div>
                        <p className="text-muted-foreground">No featured trips available yet</p>
                        {user && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Share your trips with the community to make them visible here
                          </p>
                        )}
                      </div>
                      {!user && (
                        <div className="pt-4">
                          <Button asChild>
                            <Link href="/auth?mode=register">Create an Account</Link>
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Join our community to create and share your own trips
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {publicTrips.map(trip => renderTripCard(trip))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}