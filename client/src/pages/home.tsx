import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaPlane } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Best Time to Travel
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect time to explore your dream destinations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent className="p-6">
              <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                <FaPlane className="w-16 h-16 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Smart Travel Planning</h2>
              <p className="text-muted-foreground">
                Get personalized suggestions for the best time to visit your favorite cities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                <FaPlane className="w-16 h-16 text-muted-foreground rotate-90" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Local Events & Weather</h2>
              <p className="text-muted-foreground">
                Discover the perfect timing based on weather and local events.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <FaPlane className="w-4 h-4" />
              Start Planning
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}