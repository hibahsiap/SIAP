"use client";

import { Search } from "lucide-react";

interface SearchFieldProps {
    placeholder: string,
    value: string, 
    onChange: (val: string) => void, 
    className?: string
}

const SearchField = ({ placeholder, value, onChange, className }: SearchFieldProps) => {
    return (
        // Ganti tingginya jadi h-[40px] min-h-[40px]
        <div className={`flex items-center gap-2 border border-[#D2D2D2] bg-white rounded-lg px-3 h-[40px] min-h-[40px] text-sm text-[#6B7280] transition-all focus-within:border-[#1D2F58] ${className}`}>
            <Search size={16} className={value ? "text-[#1D2F58]" : "text-[#6B7280]"} />

            <input 
                type="text"  
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full bg-transparent transition-all focus:outline-none text-black placeholder:text-[#6B7280]"
            />
        </div>
    )
}

export default SearchField;