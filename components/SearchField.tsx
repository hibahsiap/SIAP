"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface SearchFieldProps {
    // icon?: any,
    // title: string,
    placeholder: string,
    className?: string
}

const SearchField = ({placeholder, className}: SearchFieldProps) => {
    const [value, setValue] = useState("")

    return (
        <div className={`flex gap-2 border border-[#D2D2D2] bg-white rounded-lg px-3 py-2 text-sm text-[#6B7280] ${className}`}>
        
            <Search size={16} />

            <input 
                type="text"  
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`transition-all focus:outline-none ${
                        value ? "text-black" : "text-[#6B7280]"
                }`}
            />
        </div>
    )
}

export default SearchField;