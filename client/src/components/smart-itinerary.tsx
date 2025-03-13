import { format, differenceInDays, addDays, parse } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Plane, Sun, Moon, Sunrise, Sunset, Clock } from "lucide-react";
import { useState } from "react";

import { TimePicker } from "./time-picker";

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
          {
            type: "essential",
            items: [
              "🛬 Airport arrival and transfer to city",
              "🏨 Hotel/accommodation check-in",
              "😴 Rest and refresh"
            ]
          },
          ...(availableHours >= 2 ? [{
            type: "suggested",
            title: "Evening Easy Activities",
            items: [
              "☕ Explore nearby cafes",
              "🍽️ Dinner at local restaurant",
              "🚶‍♂️ Casual stroll in neighborhood",
              "🛍️ Visit local convenience stores"
            ]
          }] : [])
        ]
      };
    } else if (dayIndex === totalDays - 1) {
      const availableHours = getAvailableTimeForDay(false, departureTime);
      return {
        title: "Departure Day",
        icon: <Plane className="-rotate-90 h-5 w-5" />,
        activities: [
          {
            type: "essential",
            items: [
              "🏨 Hotel check-out",
              "🎒 Pack and prepare",
              "🚕 Transfer to airport",
              "🛫 Departure"
            ]
          },
          ...(availableHours >= 2 ? [{
            type: "suggested",
            title: "Morning Quick Visits",
            items: [
              "☕ Local breakfast spot",
              "🛍️ Last-minute souvenirs",
              "📸 Final city photos",
              "🍵 Quick visit to nearby attractions"
            ]
          }] : [])
        ]
      };
    } else {
      // Full day exploration grouped by themes
      const cityThemes = [
        {
          type: "cultural",
          title: "Cultural Exploration",
          icon: "🏛️",
          items: [
            "Historical landmarks",
            "Local museums",
            "Art galleries",
            "Traditional markets"
          ]
        },
        {
          type: "nature",
          title: "Nature & Outdoors",
          icon: "🌿",
          items: [
            "City parks",
            "Botanical gardens",
            "Scenic viewpoints",
            "Walking trails"
          ]
        },
        {
          type: "entertainment",
          title: "Entertainment & Lifestyle",
          icon: "🎭",
          items: [
            "Shopping districts",
            "Local performances",
            "Food markets",
            "Entertainment venues"
          ]
        },
        {
          type: "culinary",
          title: "Food & Dining",
          icon: "🍽️",
          items: [
            "Local restaurants",
            "Street food spots",
            "Cafes and dessert shops",
            "Food tours"
          ]
        }
      ];

      // Select different themes based on the day number to ensure variety
      const selectedThemes = [
        cityThemes[dayIndex % cityThemes.length],
        cityThemes[(dayIndex + 1) % cityThemes.length]
      ];

      return {
        title: `Day ${dayIndex + 1}`,
        icon: dayIndex % 2 === 0 ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
        activities: selectedThemes.map(theme => ({
          type: "suggested",
          title: theme.title,
          icon: theme.icon,
          items: theme.items.map(item => `${theme.icon} ${item}`)
        }))
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
                <div className="space-y-4">
                  {dayPlan.activities.map((activityGroup, i) => (
                    <div key={i} className="space-y-2">
                      {activityGroup.title && (
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {activityGroup.icon} {activityGroup.title}
                        </h4>
                      )}
                      <ul className="space-y-2">
                        {activityGroup.items.map((activity, j) => (
                          <li key={j} className="text-sm">
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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