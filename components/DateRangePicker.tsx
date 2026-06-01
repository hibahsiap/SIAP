"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: DateRange;
  onChange: (range: DateRange) => void;
  onApply: (range: DateRange) => void;
  onCancel: () => void;
  align?: "start" | "center" | "end";
  trigger: React.ReactNode;
}

export function formatDateRange(range: DateRange): string {
  if (!range.from || !range.to) return "Custom Range";
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return `${fmt(range.from)} – ${fmt(range.to)}`;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isBetween(date: Date, from: Date, to: Date) {
  return date > from && date < to;
}

export function DateRangePicker({
  open, onOpenChange,
  value, onChange,
  onApply, onCancel,
  align = "end",
  trigger,
}: DateRangePickerProps) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [hovered, setHovered] = useState<Date | null>(null);

  const handlePrev = () =>
    month === 0 ? (setMonth(11), setYear((y) => y - 1)) : setMonth((m) => m - 1);
  const handleNext = () =>
    month === 11 ? (setMonth(0), setYear((y) => y + 1)) : setMonth((m) => m + 1);

  const handleDateClick = (date: Date) => {
    if (!value.from || (value.from && value.to)) {
      onChange({ from: date, to: null });
    } else {
      onChange(
        date < value.from
          ? { from: date, to: value.from }
          : { from: value.from, to: date }
      );
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const effectiveTo = value.to || hovered;

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const hasValidRange = !!(value.from && value.to);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>

      <PopoverContent
        align={align}
        sideOffset={8}
        className="w-auto p-4 rounded-xl shadow-xl border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <Calendar size={14} className="text-[#041942]" />
          <span className="text-xs font-semibold text-[#041942]">Select Date Range</span>
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-3 px-1">
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-7 w-7">
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-semibold text-[#041942]">
            {MONTHS[month]} {year}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNext} className="h-7 w-7">
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((date, idx) => {
            if (!date) return <div key={`e-${idx}`} />;

            const isFrom     = !!(value.from && isSameDay(date, value.from));
            const isTo       = !!(value.to && isSameDay(date, value.to));
            const isHoverEnd = !!(!value.to && hovered && isSameDay(date, hovered));
            const inRange    = !!(value.from && effectiveTo && value.from < effectiveTo && isBetween(date, value.from, effectiveTo));
            const isToday    = isSameDay(date, today);
            const isEndpoint = isFrom || isTo;

            return (
              <div
                key={date.toISOString()}
                className="relative flex items-center justify-center h-8"
                onMouseEnter={() => setHovered(date)}
                onMouseLeave={() => setHovered(null)}
              >
                {inRange && <div className="absolute inset-y-0 inset-x-0 bg-blue-50" />}
                {(isTo || isHoverEnd) && value.from && (
                  <div className="absolute inset-y-0 left-0 right-1/2 bg-blue-50" />
                )}
                {isFrom && (value.to || hovered) && (
                  <div className="absolute inset-y-0 right-0 left-1/2 bg-blue-50" />
                )}
                <button
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "relative z-10 w-7 h-7 rounded-full text-xs font-medium transition-all",
                    isEndpoint || isHoverEnd
                      ? "bg-[#041942] text-white shadow-sm"
                      : inRange
                      ? "text-[#041942] hover:bg-blue-100"
                      : isToday
                      ? "text-blue-600 font-bold hover:bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-xs text-gray-500"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!hasValidRange}
            onClick={() => hasValidRange && onApply(value)}
            className="text-xs bg-[#041942] hover:bg-[#062460] text-white disabled:opacity-40"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
