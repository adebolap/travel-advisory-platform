import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Globe, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatContext {
  city?: string;
  interests?: string[];
  travelDates?: {
    startDate?: string;
    endDate?: string;
  };
}

export default function TravelChatbot({ 
  context 
}: { 
  context?: ChatContext 
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting when component mounts
  useEffect(() => {
    let greeting = "👋 Hi there! I'm Voyager, your AI travel companion. I can help you plan your trip, find local attractions, or answer any travel-related questions. What's on your mind?";
    
    // Personalize greeting if we have context
    if (context?.city) {
      greeting = `👋 Hi there! I'm Voyager, your AI travel companion. I see you're interested in ${context.city}! What would you like to know about this destination?`;
    }
    
    const initialMessage: Message = {
      id: "welcome",
      text: greeting,
      sender: "bot",
      timestamp: new Date(),
    };
    
    setMessages([initialMessage]);
  }, [context]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Add user message to conversation history
      const newUserMessage: ChatMessage = {
        role: "user",
        content: input
      };
      
      // Create updated conversation history for the API request
      const updatedHistory = [...conversationHistory, newUserMessage];
      
      // Send request to the chatbot API
      const response = await apiRequest("POST", "/api/chatbot", {
        messages: updatedHistory,
        city: context?.city,
        interests: context?.interests,
        travelDates: context?.travelDates
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const botResponse = await response.json();
      
      // Update conversation history with both the user message and bot response
      setConversationHistory([...updatedHistory, botResponse]);
      
      // Add bot response to UI
      const botMessage: Message = {
        id: Date.now().toString(),
        text: botResponse.content,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error communicating with chatbot API:", error);
      
      toast({
        title: "Communication Error",
        description: "I'm having trouble connecting to my knowledge base. Please try again in a moment.",
        variant: "destructive"
      });
      
      // Add error message to UI
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-lg border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Voyager AI</h3>
            <p className="text-xs text-muted-foreground">Your intelligent travel companion</p>
          </div>
        </CardTitle>
        {context?.city && (
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            Currently exploring: <span className="font-medium ml-1">{context.city}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-2">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 chat-scrollbar">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-start gap-2 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.sender === "user"
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                >
                  {message.sender === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-3 max-w-[85%] ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Intl.DateTimeFormat('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    }).format(message.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-secondary-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-secondary-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-secondary-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about destinations, activities, tips..."
            className="flex-1 pr-10 focus-visible:ring-primary/50"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-0 top-0 rounded-l-none h-full"
            disabled={isTyping || !input.trim()}
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
