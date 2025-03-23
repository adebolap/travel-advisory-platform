import TravelChatbot from "@/components/travel-chatbot";
import { Card } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Travel Assistant</h1>
            <p className="text-muted-foreground">
              Chat with your AI travel companion to get personalized recommendations and assistance
            </p>
          </div>
          <TravelChatbot />
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground text-center">
              Your travel companion is here to help you plan your perfect trip.
              Ask about destinations, weather, attractions, or any travel-related questions!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
