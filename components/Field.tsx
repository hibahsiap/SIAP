"use client";

import { ChangeEvent } from "react";

interface FieldProps {
    icon?: any;
    title: string;
    placeholder: string;
    value: string; 
    onChange: (e: ChangeEvent<HTMLInputElement>) => void; 
    type?: string; 
}

const Field = ({ icon, title, placeholder, value, onChange, type = "text" }: FieldProps) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor={title} className="flex flex-row gap-1 items-center text-[#546064]">
        {icon && icon}
        <h1 className="font-semibold text-[12px] uppercase">{title}</h1>
      </label>

      <input 
        type={type} 
        id={title} 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-[#D2D2D2] rounded-lg px-4 py-3 text-xs w-full transition-all focus:outline-none focus:border-[#1D2F58] ${
          value ? "text-black" : "text-[#6B7280]"
        }`}
      />
    </div>
  );
}

export default Field;