interface TimeOption {
  value: string;
  label: string;
}

interface TimeRangeSelectorProps {
  options: TimeOption[]; 
  value: string;         
  onChange: (value: string) => void; 
  prefixLabel?: string;  
}

export const TimeRange = ({ 
  options, 
  value, 
  onChange, 
  prefixLabel = "Range Time by :" 
}: TimeRangeSelectorProps) => {
  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-2 bg-white">
      <span className="text-xs text-gray-500">{prefixLabel}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs font-medium outline-none bg-transparent cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};