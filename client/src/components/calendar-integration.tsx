import { Button } from "@/components/ui/button";
import { CalendarPlus, Calendar as CalendarIcon, Share2 } from "lucide-react";
import { format } from "date-fns";

interface CalendarIntegrationProps {
  event: {
    id: number;
    name: string;
    description: string;
    date: string;
    location?: string;
    endDate?: string; // Optional end date for multi-day events
  };
}

export default function CalendarIntegration({ event }: CalendarIntegrationProps) {
  const generateGoogleCalendarUrl = () => {
    const eventDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours if no end date

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
    const endDate = event.endDate ? new Date(event.endDate) : new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${event.name}`,
      `DTSTART:${format(eventDate, "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTEND:${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location || ""}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  };

  const addToGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(), '_blank');
  };

  const addToAppleCalendar = () => {
    const link = document.createElement('a');
    link.href = generateAppleCalendarUrl();
    link.setAttribute('download', `${event.name.replace(/[^a-z0-9]/gi, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up the URL object
  };

  const shareToMobile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback for browsers that don't support sharing
      addToAppleCalendar();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
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
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={shareToMobile}
      >
        <Share2 className="h-4 w-4" />
        Share to Mobile
      </Button>
    </div>
  );
}