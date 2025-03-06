import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plane, Palmtree, Mountain, Coffee, Camera, Book, Map } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  illustration: React.ReactNode;
  options: {
    value: string;
    label: string;
    description: string;
  }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "travel-style",
    question: "What's your ideal way to explore a new destination?",
    illustration: <Plane className="w-16 h-16 text-primary animate-bounce" />,
    options: [
      {
        value: "adventurer",
        label: "Adventurer",
        description: "Off the beaten path, seeking thrilling experiences"
      },
      {
        value: "cultural",
        label: "Culture Explorer",
        description: "Museums, historical sites, and local traditions"
      },
      {
        value: "relaxer",
        label: "Relaxation Seeker",
        description: "Beaches, spas, and peaceful retreats"
      },
      {
        value: "foodie",
        label: "Food Enthusiast",
        description: "Local cuisine, food tours, and cooking classes"
      }
    ]
  },
  {
    id: "destination-type",
    question: "What type of destination appeals to you most?",
    illustration: <Palmtree className="w-16 h-16 text-primary animate-pulse" />,
    options: [
      {
        value: "beach",
        label: "Tropical Paradise",
        description: "Sun, sand, and crystal-clear waters"
      },
      {
        value: "city",
        label: "Urban Explorer",
        description: "Bustling cities with rich culture and nightlife"
      },
      {
        value: "nature",
        label: "Nature Lover",
        description: "National parks, hiking trails, and wildlife"
      },
      {
        value: "mountain",
        label: "Mountain Seeker",
        description: "Scenic peaks, fresh air, and outdoor activities"
      }
    ]
  },
  {
    id: "activity-preference",
    question: "How do you like to spend your time while traveling?",
    illustration: <Camera className="w-16 h-16 text-primary animate-spin-slow" />,
    options: [
      {
        value: "sightseeing",
        label: "Sightseeing",
        description: "Visiting landmarks and taking photos"
      },
      {
        value: "relaxation",
        label: "Relaxation",
        description: "Taking it easy and enjoying the atmosphere"
      },
      {
        value: "adventure",
        label: "Adventure",
        description: "Trying new activities and seeking thrills"
      },
      {
        value: "learning",
        label: "Learning",
        description: "Taking classes and learning about local culture"
      }
    ]
  },
  {
    id: "travel-planning",
    question: "What's your preferred way to plan trips?",
    illustration: <Map className="w-16 h-16 text-primary animate-pulse" />,
    options: [
      {
        value: "spontaneous",
        label: "Go with the Flow",
        description: "Minimal planning, maximum flexibility"
      },
      {
        value: "organized",
        label: "Well Organized",
        description: "Detailed itineraries and advance bookings"
      },
      {
        value: "balanced",
        label: "Balanced Approach",
        description: "Mix of planned activities and free time"
      },
      {
        value: "guided",
        label: "Guided Experience",
        description: "Professional tours and local guides"
      }
    ]
  },
  {
    id: "travel-companions",
    question: "Who do you prefer to travel with?",
    illustration: <Coffee className="w-16 h-16 text-primary animate-bounce" />,
    options: [
      {
        value: "solo",
        label: "Solo Traveler",
        description: "Independent exploration at your own pace"
      },
      {
        value: "family",
        label: "Family Time",
        description: "Creating memories with loved ones"
      },
      {
        value: "friends",
        label: "Friend Group",
        description: "Sharing adventures with friends"
      },
      {
        value: "partner",
        label: "Romantic Getaway",
        description: "Quality time with your significant other"
      }
    ]
  }
];

export default function TravelQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const submitQuizMutation = useMutation({
    mutationFn: async (responses: Record<string, string>) => {
      const res = await apiRequest("POST", "/api/quiz/submit", { responses });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz completed! 🎉",
        description: "Your travel preferences have been saved. Let's find your perfect destinations!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save quiz results",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnswer = (value: string) => {
    const newAnswers = {
      ...answers,
      [quizQuestions[currentQuestion].id]: value,
    };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuizMutation.mutateAsync(newAnswers);
    }
  };

  const currentQuizQuestion = quizQuestions[currentQuestion];

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Discover Your Travel Style</h1>
        <p className="text-muted-foreground">
          Let's find out what kind of traveler you are and create your perfect journey!
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="mt-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {currentQuizQuestion.illustration}
          </div>
          <CardTitle className="text-2xl mb-2">
            {currentQuizQuestion.question}
          </CardTitle>
          <CardDescription>
            Question {currentQuestion + 1} of {quizQuestions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {currentQuizQuestion.options.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start text-left"
                onClick={() => handleAnswer(option.value)}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-muted-foreground">
                  {option.description}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}