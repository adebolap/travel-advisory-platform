import { format, differenceInDays, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Plane, Sun, Moon, Sunrise, Sunset } from "lucide-react";

interface SmartItineraryProps {
  dateRange: DateRange | undefined;
  cityName: string;
}

export function SmartItinerary({ dateRange, cityName }: SmartItineraryProps) {
  if (!dateRange?.from || !dateRange?.to) return null;

  const totalDays = differenceInDays(dateRange.to, dateRange.from) + 1;
  const isShortTrip = totalDays <= 3;

  const generateDayPlan = (dayIndex: number, totalDays: number) => {
    if (dayIndex === 0) {
      return {
        title: "Arrival Day",
        icon: <Plane className="rotate-90 h-5 w-5" />,
        activities: [
          "🛬 Airport arrival and check-in",
          "🏨 Hotel/accommodation check-in",
          "🚶‍♂️ Light exploration of nearby area",
          "🍽️ Dinner at local restaurant",
          "😴 Early rest to adjust to timezone"
        ]
      };
    } else if (dayIndex === totalDays - 1) {
      return {
        title: "Departure Day",
        icon: <Plane className="-rotate-90 h-5 w-5" />,
        activities: [
          "🏨 Hotel check-out",
          "🎒 Pack and prepare",
          "🚕 Transfer to airport",
          "🛫 Departure"
        ]
      };
    } else {
      return {
        title: `Day ${dayIndex + 1}`,
        icon: dayIndex % 2 === 0 ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
        activities: [
          "🌅 Morning activities",
          "🏛️ Main attractions visit",
          "🍽️ Local cuisine experience",
          "🌆 Evening entertainment"
        ]
      };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <Sunrise className="h-5 w-5" />
        <h3>Smart Itinerary for {cityName}</h3>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: totalDays }).map((_, index) => {
          const currentDate = addDays(dateRange.from!, index);
          const dayPlan = generateDayPlan(index, totalDays);
          
          return (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                {dayPlan.icon}
                <div>
                  <CardTitle className="text-lg">{dayPlan.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(currentDate, "EEEE, MMM d")}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dayPlan.activities.map((activity, i) => (
                    <li key={i} className="text-sm">
                      {activity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {isShortTrip && (
        <p className="text-sm text-muted-foreground italic">
          💡 Tip: For short trips, consider focusing on key attractions near your accommodation to maximize your time.
        </p>
      )}
    </div>
  );
}
