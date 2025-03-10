import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Attraction {
  id: string;
  name: string;
  location: string;
  rating: number;
  types: string[];
  photo?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

interface ItineraryBuilderProps {
  city: string;
}

export default function ItineraryBuilder({ city }: ItineraryBuilderProps) {
  const { data: attractions, isLoading, error, refetch } = useQuery<Attraction[]>({
    queryKey: ['/api/attractions', city],
    queryFn: async () => {
      if (!city?.trim()) {
        throw new Error('City parameter is required');
      }
      const params = new URLSearchParams({ city: city.trim() });
      const response = await fetch(`/api/attractions?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to fetch attractions');
      }
      return response.json();
    },
    enabled: Boolean(city?.trim()),
    retry: 1,
    refetchOnWindowFocus: false
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <CardTitle className="text-lg">Unable to Load Attractions</CardTitle>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load attractions'}
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!attractions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attractions</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">
            No attractions found for {city}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Attractions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {attractions.map((attraction) => (
          <div
            key={attraction.id}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50"
          >
            <div className="flex items-start gap-4">
              {attraction.photo && (
                <img
                  src={attraction.photo}
                  alt={attraction.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{attraction.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {attraction.location}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium">
                    {attraction.rating.toFixed(1)} ★
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {attraction.types.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}