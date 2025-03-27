import TravelChatbot from "@/components/travel-chatbot";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Globe, MessageSquareText, Sparkles } from "lucide-react";
import CitySearch from "@/components/city-search";
import { format } from "date-fns";

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
    </div>
  );
}
