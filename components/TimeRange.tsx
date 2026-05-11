"use client";

import { useState, useRef, useEffect } from "react";

interface TimeOption {
  value: string;
  label: string;
  colorClass?: string;
}

interface TimeRangeSelectorProps {
  options: TimeOption[];
  value: string;
  onChange: (value: string) => void;
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
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Default Dropdown
  if (variant === 'default') {
    return (
      <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-2 bg-white">
        {prefixLabel && <span className="text-xs text-gray-500">{prefixLabel}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-xs font-medium outline-none bg-transparent cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  // Badge Header Chat
  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all cursor-pointer select-none ${
          selectedOption?.colorClass || 'bg-[#F4F7F9] text-[#64748B]'
        }`}
      >
        <span className="text-[12px] font-semibold truncate pr-2">
          {selectedOption ? selectedOption.label : prefixLabel}
        </span>
        <svg
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          width="8" height="5" viewBox="0 0 10 6" fill="none"
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[99] mt-2 w-full min-w-[120px] bg-white border border-gray-100 shadow-xl rounded-xl py-1 overflow-hidden animate-in fade-in zoom-in duration-150">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-[12px] font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center gap-2 ${
                value === opt.value ? 'bg-gray-50 text-slate-900' : 'text-slate-600'
              }`}
            >

              {opt.colorClass && (
                <div className={`w-2 h-2 rounded-full ${opt.colorClass.split(' ')[0]}`}></div>
              )}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};