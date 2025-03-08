import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plane, Palmtree, Mountain, Coffee, Camera, Map, ArrowLeftCircle } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const quizQuestions = [
  {
    id: "travel-style",
    question: "What's your ideal way to explore a new destination?",
    illustration: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1000&auto=format",
    animatedIcon: <Plane className="w-16 h-16 text-primary animate-bounce" />,
    options: [
      {
        value: "adventurer",
        label: "Adventurer",
        description: "Off the beaten path, seeking thrilling experiences",
        image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=500&auto=format"
      },
      {
        value: "cultural",
        label: "Culture Explorer",
        description: "Museums, historical sites, and local traditions",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=500&auto=format"
      },
      {
        value: "relaxer",
        label: "Relaxation Seeker",
        description: "Beaches, spas, and peaceful retreats",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format"
      },
      {
        value: "foodie",
        label: "Food Enthusiast",
        description: "Local cuisine, food tours, and cooking classes",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=500&auto=format"
      }
    ]
  }
];

export default function TravelQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [quizQuestions[currentQuestion].id]: value,
    };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      toast({
        title: "Quiz completed! 🎉",
        description: "Your travel preferences have been saved.",
      });
      setTimeout(() => setLocation("/"), 1500);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQuizQuestion = quizQuestions[currentQuestion];

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Discover Your Travel Style</h1>
        <p className="text-muted-foreground">
          Let's find out what kind of traveler you are and create your perfect journey!
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="mt-8">
        <CardHeader className="text-center relative">
          {currentQuestion > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2"
              onClick={handleBack}
            >
              <ArrowLeftCircle className="h-6 w-6 text-primary" />
            </Button>
          )}
          <div className="flex justify-center mb-4">
            {currentQuizQuestion.animatedIcon}
          </div>
          <CardTitle className="text-3xl">
            {currentQuizQuestion.question}
          </CardTitle>
          <CardDescription>
            Question {currentQuestion + 1} of {quizQuestions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuizQuestion.options.map((option) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="h-auto p-0 overflow-hidden flex flex-col items-stretch text-left hover:scale-[1.02] transition-transform"
                  onClick={() => handleAnswer(option.value)}
                >
                  {option.image && (
                    <div className="relative h-40 w-full">
                      <img
                        src={option.image}
                        alt={option.label}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
