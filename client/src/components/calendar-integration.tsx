import { Button } from "@/components/ui/button";
import { CalendarPlus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

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
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

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

  const addToCalendar = (url: string, fileName?: string) => {
    if (fileName) {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80"
        onClick={() => addToCalendar(generateGoogleCalendarUrl())}
      >
        <CalendarPlus className="h-4 w-4 text-primary-foreground" />
        Google Calendar
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
        onClick={() => addToCalendar(generateAppleCalendarUrl(), `${event.name}.ics`)}
      >
        <CalendarIcon className="h-4 w-4 text-secondary-foreground" />
        Apple Calendar
      </Button>
    </motion.div>
  );
}
