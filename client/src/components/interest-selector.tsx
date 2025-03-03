import { Badge } from "@/components/ui/badge";

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
}

const interests = [
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "nightlife", label: "Nightlife", icon: "🌙" },
  { id: "culture", label: "Cultural Events", icon: "🎭" },
  { id: "food", label: "Food & Cuisine", icon: "🍜" },
  { id: "nature", label: "Nature & Outdoors", icon: "🏞️" },
  { id: "budget", label: "Budget Travel", icon: "💰" },
  { id: "tips", label: "Travel Tips", icon: "💡" },
  { id: "local", label: "Local Experience", icon: "🏠" },
  { id: "transport", label: "Transportation", icon: "🚇" }
].sort((a, b) => a.label.localeCompare(b.label));

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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {interests.map(({ id, label, icon }) => (
          <Badge
            key={id}
            variant={selectedInterests.includes(id) ? "default" : "outline"}
            className={`
              cursor-pointer py-3 px-4 flex items-center justify-center gap-2
              hover:bg-primary/90 transition-colors text-base
              ${selectedInterests.includes(id) ? 'bg-primary text-white' : 'bg-transparent'}
            `}
            onClick={() => toggleInterest(id)}
          >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}