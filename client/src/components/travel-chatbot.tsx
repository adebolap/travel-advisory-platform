import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function TravelChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting when component mounts
  useEffect(() => {
    const initialMessage: Message = {
      id: "welcome",
      text: "👋 Hi there! I'm your travel companion. I can help you plan your trip, find local attractions, or answer any travel-related questions. What's on your mind?",
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot thinking and response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    // Simple response logic - to be enhanced with AI integration
    const input = userInput.toLowerCase();
    if (input.includes("hello") || input.includes("hi")) {
      return "👋 Hello! How can I help you with your travel plans today?";
    }
    if (input.includes("weather")) {
      return "🌤️ I can help you check the weather forecast for your destination. Which city are you interested in?";
    }
    if (input.includes("restaurant") || input.includes("food")) {
      return "🍽️ I'd love to help you find some great local restaurants! Could you tell me what type of cuisine you're in the mood for?";
    }
    if (input.includes("hotel") || input.includes("stay")) {
      return "🏨 I can help you find the perfect accommodation. What's your budget range and preferred location?";
    }
    return "🌍 That's interesting! Could you tell me more about what you're looking for?";
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Travel Companion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.text}
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
                <div className="bg-muted rounded-lg px-4 py-2">
                  <span className="animate-pulse">typing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about travel..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
