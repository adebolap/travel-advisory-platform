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
              "w-full justify-start text-left font-normal h-12 sm:h-10 mobile-button",
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
          className="w-auto p-0 shadow-lg bg-background border rounded-lg relative mobile-modal" 
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col w-full max-h-[80vh] sm:max-h-none">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={handleSelect}
              numberOfMonths={1}
              className="p-3 mobile-scroll-container"
              initialFocus
              fromDate={new Date()} // Prevent selecting past dates
            />
            <div className="flex justify-end gap-2 p-3 border-t bg-background sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => {
                  setTempRange(dateRange);
                  setIsOpen(false);
                }}
                className="mobile-button"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                className="mobile-button"
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