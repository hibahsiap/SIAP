"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState, ChangeEvent } from "react";

interface FieldPasswordProps {
    title: string;
    placeholder: string;
    setIcon: boolean;
    value: string; 
    onChange: (e: ChangeEvent<HTMLInputElement>) => void; 
}

const FieldPassword = ({ title, placeholder, setIcon, value, onChange }: FieldPasswordProps) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <div className="w-full flex flex-col gap-1">
            <label htmlFor={title} className="flex flex-row gap-1 items-center text-[#546064]">
                {setIcon && <LockKeyhole size={13} />}
                <h1 className="font-semibold text-[12px] uppercase">{title}</h1>
            </label>
            <div className="relative">
                <input 
                    type={isVisible ? "text" : "password"}
                    id={title} 
                    placeholder={placeholder} 
                    value={value}
                    onChange={onChange}
                    className={`border border-[#D2D2D2] rounded-lg px-4 py-3 text-xs w-full transition-all focus:outline-none focus:border-[#1D2F58] ${
                        value ? "text-black" : "text-[#6B7280]"
                    }`}
                />

                <button 
                    type="button"
                    onClick={toggleVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1D2F58]"
                >
                    {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
            </div>
        </div>
    )
}

export default FieldPassword;