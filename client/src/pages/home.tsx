import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaPlane, FaCompass, FaMap, FaCalendarAlt, FaSuitcase } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 mix-blend-multiply" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2200&auto=format')",
            filter: 'brightness(0.8)'
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Your Perfect Travel Companion
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Plan smarter, travel better. Get personalized recommendations, weather insights, and local experiences.
            </p>
            <Link href="/explore">
              <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90">
                <FaCompass className="w-5 h-5" />
                Start Exploring
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="funky-card">
            <CardContent className="p-6">
              <div className="h-48 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg mb-4 
                            flex items-center justify-center group">
                <FaMap className="w-16 h-16 text-primary transition-transform group-hover:scale-110" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Smart Itineraries</h2>
              <p className="text-muted-foreground">
                Create personalized travel plans based on your interests and schedule.
              </p>
            </CardContent>
          </Card>

          <Card className="funky-card">
            <CardContent className="p-6">
              <div className="h-48 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg mb-4 
                            flex items-center justify-center group">
                <FaCalendarAlt className="w-16 h-16 text-primary transition-transform group-hover:scale-110" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Local Events</h2>
              <p className="text-muted-foreground">
                Discover festivals, shows, and cultural events at your destination.
              </p>
            </CardContent>
          </Card>

          <Card className="funky-card">
            <CardContent className="p-6">
              <div className="h-48 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg mb-4 
                            flex items-center justify-center group">
                <FaSuitcase className="w-16 h-16 text-primary transition-transform group-hover:scale-110" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Smart Packing</h2>
              <p className="text-muted-foreground">
                Get customized packing lists based on weather and activities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inspiration Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8 gradient-text">Popular Destinations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Paris', 'Tokyo', 'New York'].map((city) => (
              <div key={city} className="relative group overflow-hidden rounded-xl">
                <div 
                  className="aspect-[4/3] bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://source.unsplash.com/featured/?${city},landmark')`
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-end p-6 transition-opacity group-hover:bg-black/50">
                  <h3 className="text-2xl font-bold text-white">{city}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/explore">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
              <FaPlane className="w-5 h-5" />
              Plan Your Next Adventure
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}