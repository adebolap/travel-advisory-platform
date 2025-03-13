import { format, differenceInDays, addDays, parse } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Plane, Sun, Moon, Sunrise, Sunset, Clock } from "lucide-react";
import { useState } from "react";

// Simple TimePicker component implementation (replace with your actual implementation)
const TimePicker: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => {
  return (
    <div>
      <label htmlFor={label}>{label}</label>
      <input type="time" id={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
};


interface SmartItineraryProps {
  dateRange: DateRange | undefined;
  cityName: string;
}

export function SmartItinerary({ dateRange, cityName }: SmartItineraryProps) {
  const [arrivalTime, setArrivalTime] = useState("14:00");
  const [departureTime, setDepartureTime] = useState("10:00");

  if (!dateRange?.from || !dateRange?.to) return null;

  const totalDays = differenceInDays(dateRange.to, dateRange.from) + 1;
  const isShortTrip = totalDays <= 3;

  // Calculate available time for activities on arrival/departure days
  const getAvailableTimeForDay = (isArrival: boolean, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    if (isArrival) {
      // Account for 4 hours airport transfer + 2 hours rest
      const availableHours = Math.max(0, 20 - (hours + 6));
      return availableHours;
    } else {
      // Account for 4 hours airport transfer before departure
      return Math.max(0, hours - 4);
    }
  };

  const generateDayPlan = (dayIndex: number, totalDays: number) => {
    if (dayIndex === 0) {
      const availableHours = getAvailableTimeForDay(true, arrivalTime);
      return {
        title: "Arrival Day",
        icon: <Plane className="rotate-90 h-5 w-5" />,
        activities: [
          "🛬 Airport arrival and transfer to city",
          "🏨 Hotel/accommodation check-in",
          ...(availableHours >= 2 ? ["🚶‍♂️ Light exploration of nearby area"] : []),
          ...(availableHours >= 4 ? ["🍽️ Dinner at local restaurant"] : []),
          "😴 Early rest to adjust to timezone"
        ]
      };
    } else if (dayIndex === totalDays - 1) {
      const availableHours = getAvailableTimeForDay(false, departureTime);
      return {
        title: "Departure Day",
        icon: <Plane className="-rotate-90 h-5 w-5" />,
        activities: [
          "🏨 Hotel check-out",
          ...(availableHours >= 2 ? ["☕ Quick breakfast & last-minute shopping"] : []),
          "🎒 Pack and prepare",
          "🚕 Transfer to airport",
          "🛫 Departure"
        ]
      };
    } else {
      // Full day activities remain the same as before
      const middleDayActivities = [
        // Morning activities
        [
          "🌅 Sunrise city walk",
          "☕ Local breakfast experience",
          "🏃‍♂️ Morning fitness in city park"
        ],
        // Main activities
        [
          "🏛️ Visit historical landmarks",
          "🎨 Explore local museums",
          "🌿 Botanical gardens tour",
          "🎭 Cultural district exploration"
        ],
        // Evening activities
        [
          "🌆 Sunset viewpoint visit",
          "🍷 Wine tasting experience",
          "🎵 Live music venue",
          "🌙 Night market exploration"
        ]
      ];

      const morningActivity = middleDayActivities[0][dayIndex % middleDayActivities[0].length];
      const mainActivity = middleDayActivities[1][dayIndex % middleDayActivities[1].length];
      const eveningActivity = middleDayActivities[2][dayIndex % middleDayActivities[2].length];

      return {
        title: `Day ${dayIndex + 1}`,
        icon: dayIndex % 2 === 0 ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
        activities: [
          morningActivity,
          "🚶‍♂️ City exploration",
          mainActivity,
          "🍽️ Local cuisine experience",
          eveningActivity
        ]
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <Sunrise className="h-5 w-5" />
        <h3>Smart Itinerary for {cityName}</h3>
      </div>

      {/* Time selection for arrival and departure */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TimePicker
          label="🛬 Arrival Time"
          value={arrivalTime}
          onChange={setArrivalTime}
        />
        <TimePicker
          label="🛫 Departure Time"
          value={departureTime}
          onChange={setDepartureTime}
        />
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