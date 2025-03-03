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

  const handleSelect = (range: DateRange | undefined) => {
    setTempRange(range);
  };

  const handleConfirm = () => {
    onDateRangeChange(tempRange);
    setIsOpen(false);
  };

  return (
    <div className="grid gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
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
              <span>Pick your travel dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-3">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={handleSelect}
              numberOfMonths={2}
              initialFocus
            />
            <div className="flex justify-end gap-2 p-3 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setTempRange(dateRange);
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Confirm Dates
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}