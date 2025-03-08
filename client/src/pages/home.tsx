import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaPlane, FaTaxi, FaUtensils, FaCalendarAlt, FaMapMarkedAlt } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Best Time to Travel
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect time to explore your dream destinations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: FaPlane,
              title: "Smart Travel Planning",
              description: "Personalized suggestions for the best time to visit your favorite cities."
            },
            {
              icon: FaCalendarAlt,
              title: "Local Events & Weather",
              description: "Discover the perfect timing based on weather and local events."
            },
            {
              icon: FaTaxi,
              title: "Transportation Options",
              description: "Access quick links to local taxi and ride-hailing services."
            },
            {
              icon: FaUtensils,
              title: "Restaurant Suggestions",
              description: "Explore top-rated local restaurants with one click."
            },
            {
              icon: FaMapMarkedAlt,
              title: "Interactive Maps",
              description: "Navigate easily with integrated map services."
            }
          ].map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <div className="h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <Icon className="w-16 h-16 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/explore">
            <Button size="lg" className="gap-2">
              <FaPlane className="w-4 h-4" />
              Start Planning
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
