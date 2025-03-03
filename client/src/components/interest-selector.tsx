import { Badge } from "@/components/ui/badge";

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
}

const interests = [
  { id: "budget", label: "Budget Travel", icon: "💰" },
  { id: "culture", label: "Cultural Events", icon: "🎭" },
  { id: "food", label: "Food & Cuisine", icon: "🍜" },
  { id: "nature", label: "Nature & Outdoors", icon: "🏞️" },
  { id: "nightlife", label: "Nightlife", icon: "🌙" },
  { id: "shopping", label: "Shopping", icon: "🛍️" }
];

export default function InterestSelector({ 
  selectedInterests,
  onInterestsChange 
}: InterestSelectorProps) {
  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      onInterestsChange(selectedInterests.filter(id => id !== interestId));
    } else {
      onInterestsChange([...selectedInterests, interestId]);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">What interests you?</h3>
      <div className="flex flex-wrap gap-2">
        {interests.map(({ id, label, icon }) => (
          <Badge
            key={id}
            variant={selectedInterests.includes(id) ? "default" : "outline"}
            className="cursor-pointer text-sm py-2 px-3"
            onClick={() => toggleInterest(id)}
          >
            {icon} {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
