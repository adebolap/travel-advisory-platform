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
            BestTimeGo
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect time to explore your dream destinations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent className="p-6">
              <img
                src="https://images.unsplash.com/photo-1605130284535-11dd9eedc58a"
                alt="Travel destination"
                className="rounded-lg mb-4 w-full h-48 object-cover"
              />
              <h2 className="text-2xl font-semibold mb-2">Smart Travel Planning</h2>
              <p className="text-muted-foreground">
                Get AI-powered suggestions for the best time to visit your favorite cities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <img
                src="https://images.unsplash.com/photo-1626093995690-ffd76c692ac8"
                alt="Cultural festival"
                className="rounded-lg mb-4 w-full h-48 object-cover"
              />
              <h2 className="text-2xl font-semibold mb-2">Local Events & Festivals</h2>
              <p className="text-muted-foreground">
                Discover the most exciting events happening at your destination.
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
