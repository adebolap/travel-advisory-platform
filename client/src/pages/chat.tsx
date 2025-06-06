import TravelChatbot from "@/components/travel-chatbot";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Globe, MessageSquareText, Sparkles, Crown, Lock } from "lucide-react";
import CitySearch from "@/components/city-search";
import { format } from "date-fns";
import { usePremium } from "@/hooks/use-premium";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface ChatContext {
  city?: string;
  interests?: string[];
  travelDates?: {
    startDate?: string;
    endDate?: string;
  };
}

export default function ChatPage() {
  const [chatContext, setChatContext] = useState<ChatContext>({});
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { canAccess, isPremium } = usePremium();
  const { user } = useAuth();
  
  // Check if the user can access the AI chatbot feature
  const canAccessChatbot = canAccess("aiChatbot");
  
  // Sample quick questions
  const quickQuestions = [
    "What are the must-visit attractions in Tokyo?",
    "How to travel on a budget in Europe?",
    "What's the best time to visit Bali?",
    "Tips for solo female travelers?",
    "How to deal with jet lag?",
    "What should I pack for a tropical vacation?",
    "Recommend hidden gems in Paris",
    "Cultural etiquette in Morocco"
  ];

  const handleCitySelect = (city: string) => {
    setChatContext(prev => ({
      ...prev,
      city
    }));
    
    // Hide suggestions after selecting a city
    setShowSuggestions(false);
  };
  
  const handleDateSelection = () => {
    // For demonstration, we'll set a sample date range
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7);
    
    setChatContext(prev => ({
      ...prev,
      travelDates: {
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(futureDate, 'yyyy-MM-dd')
      }
    }));
  };
  
  const handleInterestSelection = (interest: string) => {
    setChatContext(prev => {
      const currentInterests = prev.interests || [];
      
      // Toggle the interest - remove if already exists, add if it doesn't
      const updatedInterests = currentInterests.includes(interest)
        ? currentInterests.filter(i => i !== interest)
        : [...currentInterests, interest];
        
      return {
        ...prev,
        interests: updatedInterests
      };
    });
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 gradient-text inline-block">AI Travel Companion</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Chat with Voyager, your personal AI travel assistant, to get personalized recommendations, 
          destination insights, and travel planning help.
        </p>
      </div>

      {canAccessChatbot ? (
        // Premium users see the full chatbot
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TravelChatbot context={chatContext} />
          </div>
          
          <div className="space-y-6">
            {/* Context panel */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  Chat Context
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Destination</label>
                    <CitySearch onCitySelect={handleCitySelect} />
                  </div>
                  
                  {chatContext.city && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Travel Dates</label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start h-auto py-2"
                          onClick={handleDateSelection}
                        >
                          {chatContext.travelDates?.startDate 
                            ? `${chatContext.travelDates.startDate} - ${chatContext.travelDates.endDate}`
                            : "Set travel dates"}
                        </Button>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Interests</label>
                        <div className="flex flex-wrap gap-2">
                          {["Culture", "Food", "Nature", "Adventure", "Relaxation"].map(interest => (
                            <Button 
                              key={interest}
                              variant={chatContext.interests?.includes(interest) ? "default" : "outline"} 
                              size="sm"
                              onClick={() => handleInterestSelection(interest)}
                            >
                              {interest}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Suggestions panel */}
            {showSuggestions && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MessageSquareText className="w-5 h-5 mr-2 text-primary" />
                    Suggested Questions
                  </h3>
                  
                  <div className="space-y-2">
                    {quickQuestions.map((question, index) => (
                      <Button 
                        key={index}
                        variant="ghost" 
                        className="w-full justify-start h-auto py-2 px-3 text-left"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <span className="line-clamp-1">{question}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* AI capabilities panel */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  AI Capabilities
                </h3>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-primary mt-0.5" />
                    <span>Destination expertise for cities worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-primary mt-0.5" />
                    <span>Personalized itinerary suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-primary mt-0.5" />
                    <span>Local customs and cultural insights</span>
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-primary mt-0.5" />
                    <span>Budget travel tips and recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-primary mt-0.5" />
                    <span>Safety advice for travelers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Non-premium users see a premium upgrade prompt
        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/25 to-purple-500/25 p-6 text-center relative">
              <span className="absolute right-4 top-4 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> Premium Feature
              </span>
              <Lock className="w-16 h-16 mx-auto mb-4 text-primary/80" />
              <h2 className="text-2xl font-bold mb-2">Premium Feature: AI Travel Chatbot</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Our advanced AI-powered travel companion is available exclusively for premium members. 
                Upgrade to access personalized travel recommendations, cultural insights, and expert advice!
              </p>
              
              <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
                <Card className="bg-white/80">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-3">Basic Features</h3>
                    <ul className="space-y-2 text-sm text-left">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Simple trip planning tools</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Basic event listings</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Current weather information</span>
                      </li>
                      <li className="flex items-start opacity-50">
                        <span className="text-red-500 mr-2">×</span>
                        <span>AI-powered travel recommendations</span>
                      </li>
                      <li className="flex items-start opacity-50">
                        <span className="text-red-500 mr-2">×</span>
                        <span>Cultural insights and local expertise</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/30">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                      Premium Features
                    </h3>
                    <ul className="space-y-2 text-sm text-left">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>All basic features included</span>
                      </li>
                      <li className="flex items-start font-medium">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>AI-powered travel chatbot</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Personalized trip recommendations</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Destination expertise and insights</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Smart itinerary suggestions</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 space-y-4">
                {!user ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Sign in to access premium features</p>
                    <Link href="/auth">
                      <Button size="lg">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <Link href="/pricing">
                      <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          {/* Feature showcase */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-6 text-center">What You'll Get with the AI Travel Companion</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Brain className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <h4 className="font-semibold mb-2">Personalized Advice</h4>
                  <p className="text-sm text-muted-foreground">
                    Get tailored recommendations based on your travel preferences, interests, and past trips.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Globe className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <h4 className="font-semibold mb-2">Cultural Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn about local customs, etiquette, and hidden gems from our AI with extensive knowledge.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquareText className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <h4 className="font-semibold mb-2">24/7 Assistance</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask any travel-related question anytime and get immediate, helpful responses.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
