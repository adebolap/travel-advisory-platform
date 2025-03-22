import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { useState } from "react";

interface DatePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DatePicker({ dateRange, onDateRangeChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange);

  const handleConfirm = () => {
    onDateRangeChange(tempRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempRange(dateRange);
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2 relative")}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>✈️ Pick your travel dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 z-50" 
          align="start"
          sideOffset={4}
        >
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
            />
            <div className="flex justify-end gap-2 mt-4 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
              >
                Confirm Dates
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}