"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/primitives/calendar";
import { InputField } from "@/components/ui/primitives/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlays/popover";

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  isLoading?: boolean;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({
    value,
    onChange,
    disabled = false,
    placeholder = "dd.MM.yyyy",
    className,
    error,
    label,
    required = false,
    disabledDates = [],
    minDate,
    maxDate,
    isLoading = false,
    ...props
  }, ref) => {
    const [open, setOpen] = React.useState(false);

    // Helper function to parse dd.MM.yyyy format (extracted from edit-auction-card)
    const parseDate = (dateString: string): Date | undefined => {
      if (!dateString) return undefined;
      const parsed = parse(dateString, "dd.MM.yyyy", new Date());
      return isValid(parsed) ? parsed : undefined;
    };

    // Helper function to format Date to dd.mm.yyyy (extracted from edit-auction-card)
    const formatDate = (date: Date | undefined): string => {
      if (!date) return "";
      return format(date, "dd.MM.yyyy");
    };

    // Prepare disabled dates for calendar
    const calendarDisabled = React.useMemo(() => {
      if (isLoading || disabled) return true;

      const disabledMatchers = [];

      // Add disabled dates array
      if (disabledDates.length > 0) {
        disabledMatchers.push(...disabledDates);
      }

      // Add minDate constraint
      if (minDate) {
        disabledMatchers.push({ before: minDate });
      }

      // Add maxDate constraint
      if (maxDate) {
        disabledMatchers.push({ after: maxDate });
      }

      return disabledMatchers.length > 0 ? disabledMatchers : undefined;
    }, [isLoading, disabled, disabledDates, minDate, maxDate]);

    return (
      <div ref={ref} className={className} {...props}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="w-full">
              <InputField
                label={label}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rightIcon="Time"
                rightIconClickable={false}
                className="w-full"
                disabled={disabled || isLoading}
                required={required}
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start" side="top" sideOffset={-26}>
            <CalendarComponent
              mode="single"
              selected={parseDate(value)}
              defaultMonth={parseDate(value) || new Date()}
              onSelect={(date) => {
                onChange(date ? formatDate(date) : "");
                setOpen(false);
              }}
              disabled={calendarDisabled}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export { DatePicker };