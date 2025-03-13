import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
}

export function TimePicker({ label, value, onChange }: TimePickerProps) {
  // Generate time options in 30-minute intervals
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return format(new Date().setHours(hour, minute), "HH:mm");
  });

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <Clock className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] mobile-scroll-container">
          {timeOptions.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
