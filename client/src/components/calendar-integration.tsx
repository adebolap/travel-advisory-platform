import { Button } from "@/components/ui/button";
import { CalendarPlus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface CalendarIntegrationProps {
  event: {
    id: number;
    name: string;
    description: string;
    date: string;
    location?: string;
  };
}

export default function CalendarIntegration({ event }: CalendarIntegrationProps) {
  const generateGoogleCalendarUrl = () => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.name,
      details: event.description,
      location: event.location || "",
      dates: `${format(eventDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateAppleCalendarUrl = () => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${format(eventDate, "yyyyMMdd'T'HHmmss")}`,
      `DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  };

  const addToGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(), '_blank');
  };

  const addToAppleCalendar = () => {
    const link = document.createElement('a');
    link.href = generateAppleCalendarUrl();
    link.setAttribute('download', `${event.name}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={addToGoogleCalendar}
      >
        <CalendarPlus className="h-4 w-4" />
        Google Calendar
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={addToAppleCalendar}
      >
        <CalendarIcon className="h-4 w-4" />
        Apple Calendar
      </Button>
    </div>
  );
}
