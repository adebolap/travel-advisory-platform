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
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal border-2 min-h-[56px] rounded-lg",
              dateRange?.from && dateRange?.to ? "border-primary/70" : "text-muted-foreground"
            )}
          >
            <div className="flex flex-col items-start gap-1 w-full">
              {dateRange?.from && dateRange?.to ? (
                <>
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      <span className="font-medium">Your Trip</span>
                    </div>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                      {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex w-full text-sm text-muted-foreground justify-between">
                    <span>{format(dateRange.from, "EEE, MMM d")}</span>
                    <span>→</span>
                    <span>{format(dateRange.to, "EEE, MMM d, yyyy")}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>When are you traveling?</span>
                </div>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 z-50" 
          align="center"
          sideOffset={8}
        >
          <div className="p-4 rounded-lg border-t-2 border-primary">
            <div className="text-center mb-4">
              <h4 className="font-medium">Select your travel dates</h4>
              <p className="text-sm text-muted-foreground">Pick a start and end date</p>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
              className="rounded-md border"
            />
            <div className="flex justify-between gap-2 mt-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="flex-1"
                disabled={!tempRange?.from || !tempRange?.to}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}