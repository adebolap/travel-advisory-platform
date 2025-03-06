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
import { useLocation } from "wouter";

interface QuizQuestion {
  id: string;
  question: string;
  illustration: string; // URL to the illustration
  animatedIcon: React.ReactNode;
  options: {
    value: string;
    label: string;
    description: string;
    image?: string; // Optional image URL for each option
  }[];
}

const quizQuestions: QuizQuestion[] = [
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
  },
  {
    id: "destination-type",
    question: "What type of destination appeals to you most?",
    illustration: "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?q=80&w=1000&auto=format",
    animatedIcon: <Palmtree className="w-16 h-16 text-primary animate-pulse" />,
    options: [
      {
        value: "beach",
        label: "Tropical Paradise",
        description: "Sun, sand, and crystal-clear waters",
        image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=500&auto=format"
      },
      {
        value: "city",
        label: "Urban Explorer",
        description: "Bustling cities with rich culture and nightlife",
        image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=500&auto=format"
      },
      {
        value: "nature",
        label: "Nature Lover",
        description: "National parks, hiking trails, and wildlife",
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=500&auto=format"
      },
      {
        value: "mountain",
        label: "Mountain Seeker",
        description: "Scenic peaks, fresh air, and outdoor activities",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500&auto=format"
      }
    ]
  },
  // More questions with similar structure...
  {
    id: "activity-preference",
    question: "How do you like to spend your time while traveling?",
    illustration: "https://images.unsplash.com/photo-1516634671336-b862e4a3b686?q=80&w=1000&auto=format",
    animatedIcon: <Camera className="w-16 h-16 text-primary animate-spin-slow" />,
    options: [
      {
        value: "sightseeing",
        label: "Sightseeing",
        description: "Visiting landmarks and taking photos",
        image: "https://images.unsplash.com/photo-1502602899954-6b24080729fc?q=80&w=500&auto=format"
      },
      {
        value: "relaxation",
        label: "Relaxation",
        description: "Taking it easy and enjoying the atmosphere",
        image: "https://images.unsplash.com/photo-1564429282-94e72c2c19c0?q=80&w=500&auto=format"
      },
      {
        value: "adventure",
        label: "Adventure",
        description: "Trying new activities and seeking thrills",
        image: "https://images.unsplash.com/photo-1503023345310-bdbcc64560a0?q=80&w=500&auto=format"
      },
      {
        value: "learning",
        label: "Learning",
        description: "Taking classes and learning about local culture",
        image: "https://images.unsplash.com/photo-1534518385022-73a038564b6a?q=80&w=500&auto=format"
      }
    ]
  },
  {
    id: "travel-planning",
    question: "What's your preferred way to plan trips?",
    illustration: "https://images.unsplash.com/photo-1531258112187-e029f10c7f92?q=80&w=1000&auto=format",
    animatedIcon: <Map className="w-16 h-16 text-primary animate-pulse" />,
    options: [
      {
        value: "spontaneous",
        label: "Go with the Flow",
        description: "Minimal planning, maximum flexibility",
        image: "https://images.unsplash.com/photo-1494548886247-459014210819?q=80&w=500&auto=format"
      },
      {
        value: "organized",
        label: "Well Organized",
        description: "Detailed itineraries and advance bookings",
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=500&auto=format"
      },
      {
        value: "balanced",
        label: "Balanced Approach",
        description: "Mix of planned activities and free time",
        image: "https://images.unsplash.com/photo-1511593355573-a614e71755e8?q=80&w=500&auto=format"
      },
      {
        value: "guided",
        label: "Guided Experience",
        description: "Professional tours and local guides",
        image: "https://images.unsplash.com/photo-1570330640953-e4b0c8776659?q=80&w=500&auto=format"
      }
    ]
  },
  {
    id: "travel-companions",
    question: "Who do you prefer to travel with?",
    illustration: "https://images.unsplash.com/photo-1573497161262-3a02860c3d9f?q=80&w=1000&auto=format",
    animatedIcon: <Coffee className="w-16 h-16 text-primary animate-bounce" />,
    options: [
      {
        value: "solo",
        label: "Solo Traveler",
        description: "Independent exploration at your own pace",
        image: "https://images.unsplash.com/photo-1532274402867-116d44132c07?q=80&w=500&auto=format"
      },
      {
        value: "family",
        label: "Family Time",
        description: "Creating memories with loved ones",
        image: "https://images.unsplash.com/photo-1507377128514-9c60a6b42b96?q=80&w=500&auto=format"
      },
      {
        value: "friends",
        label: "Friend Group",
        description: "Sharing adventures with friends",
        image: "https://images.unsplash.com/photo-1534240177539-6685c59c5c31?q=80&w=500&auto=format"
      },
      {
        value: "partner",
        label: "Romantic Getaway",
        description: "Quality time with your significant other",
        image: "https://images.unsplash.com/photo-1578573704119-a3f91d205223?q=80&w=500&auto=format"
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

  const submitQuizMutation = useMutation({
    mutationFn: async (responses: Record<string, string>) => {
      const res = await apiRequest("POST", "/api/quiz/submit", {
        responses,
        preferences: {
          travelStyle: responses["travel-style"],
          preferredActivities: [responses["activity-preference"]],
          lastQuizDate: new Date().toISOString(),
        }
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz completed! 🎉",
        description: "Your travel preferences have been saved. Let's find your perfect destinations!",
      });
      // Redirect to home page after successful submission
      setTimeout(() => setLocation("/"), 1500);
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
    <div className="container max-w-4xl py-8 space-y-6">
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
            {currentQuizQuestion.animatedIcon}
          </div>
          <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
            <img 
              src={currentQuizQuestion.illustration} 
              alt={currentQuizQuestion.question}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <CardTitle className="text-3xl text-white px-4">
                {currentQuizQuestion.question}
              </CardTitle>
            </div>
          </div>
          <CardDescription>
            Question {currentQuestion + 1} of {quizQuestions.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuizQuestion.options.map((option) => (
              <Button
                key={option.value}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}