"use client";

import { ElementType, useState } from "react";

interface FieldProps {
    icon?: any,
    title: string,
    placeholder: string
}

const Field = ({icon, title, placeholder}: FieldProps) => {
    const [value, setValue] = useState("")

    return (
        <div className="w-full flex flex-col gap-1">
            <label htmlFor={title} className="flex flex-row gap-1 items-center text-[#546064]">
                {icon && icon}
                <h1 className="font-semibold text-[12px] uppercase">{title}</h1>
            </label>

            <input 
                type="text" 
                id={title} 
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`border border-[#D2D2D2] rounded-lg px-4 py-3 text-xs w-full transition-all focus:outline-none ${
                        value ? "text-black" : "text-[#6B7280]"
                }`}
            />
        </div>
    )
}

export default Field;