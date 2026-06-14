"use client";

import { useState, useRef, useEffect } from "react";
import { DateRangePicker, DateRange, formatDateRange } from "@/components/DateRangePicker";
import { ChevronDown } from "lucide-react";

interface TimeOption {
  value: string;
  label: string;
  colorClass?: string;
}

interface TimeRangeSelectorProps {
  options: TimeOption[];
  value: string;
  onChange: (value: string, dateRange?: DateRange) => void;
  prefixLabel?: string;
  variant?: 'default' | 'badge';
}

export const TimeRange = ({
  options,
  value,
  onChange,
  prefixLabel,
  variant = 'default'
}: TimeRangeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  // State khusus default variant untuk calendar
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange]       = useState<DateRange>({ from: null, to: null });
  const [appliedRange, setAppliedRange] = useState<DateRange>({ from: null, to: null });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Default Dropdown (Modernized) ────────────────────────────────────────────
  if (variant === 'default') {
    const handleOptionSelect = (selected: string) => {
      if (selected === 'custom') {
        setCalendarOpen(true);
      } else {
        setAppliedRange({ from: null, to: null });
        onChange(selected);
      }
      setIsOpen(false);
    };

    const handleApply = (range: DateRange) => {
      setAppliedRange(range);
      setCalendarOpen(false);
      onChange('custom', range);
    };

    const handleCancel = () => {
      setCalendarOpen(false);
      setDateRange(appliedRange); 
    };

    const customLabel =
      value === 'custom' && appliedRange.from && appliedRange.to
        ? formatDateRange(appliedRange)
        : 'Custom Range';

    const displayLabel = value === 'custom' 
      ? customLabel 
      : (selectedOption?.label ?? options[0]?.label ?? 'Select');

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Modern trigger button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 2xl:py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer select-none min-w-[120px]"
        >
          {prefixLabel && (
            <span className="text-xs 2xl:text-sm text-gray-500 font-medium whitespace-nowrap">{prefixLabel}</span>
          )}
          <span className="text-xs 2xl:text-sm font-semibold text-slate-800 whitespace-nowrap">{displayLabel}</span>
          <ChevronDown
            size={12}
            className={`text-gray-400 transition-transform duration-200 ml-auto ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown menu — positioned directly below trigger */}
        {isOpen && (
          <div
            className="absolute left-0 z-[99] w-full min-w-[140px] bg-white border border-gray-100 shadow-lg rounded-lg py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ top: '100%', marginTop: '4px' }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleOptionSelect(opt.value)}
                className={`w-full px-3 py-2 text-xs 2xl:text-sm font-medium cursor-pointer transition-colors text-left flex items-center gap-2 ${
                  value === opt.value
                    ? 'bg-slate-50 text-slate-900'
                    : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {value === opt.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1D2F58]" />
                )}
                {opt.value === 'custom' ? customLabel : opt.label}
              </button>
            ))}
          </div>
        )}

        <DateRangePicker
          open={calendarOpen}
          onOpenChange={(open) => { if (!open) handleCancel(); }}
          value={dateRange}
          onChange={setDateRange}
          onApply={handleApply}
          onCancel={handleCancel}
          align="end"
          trigger={<span className="absolute right-0 top-full" />}
        />
      </div>
    );
  }

  // ─── Badge Header Chat ────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all cursor-pointer select-none ${
          selectedOption?.colorClass || 'bg-[#F4F7F9] text-[#64748B]'
        }`}
      >
        <span className="text-[12px] font-semibold truncate pr-2">
          {selectedOption ? selectedOption.label : prefixLabel}
        </span>
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 z-[99] w-full min-w-[120px] bg-white border border-gray-100 shadow-xl rounded-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ top: '100%', marginTop: '4px' }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-[12px] font-medium cursor-pointer transition-colors text-left flex items-center gap-2 ${
                value === opt.value ? 'bg-gray-50 text-slate-900' : 'text-slate-600 hover:bg-gray-50'
              }`}
            >
              {opt.colorClass && (
                <div className={`w-2 h-2 rounded-full ${opt.colorClass.split(' ')[0]}`}></div>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
