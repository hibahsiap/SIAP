"use client";

import { useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { ProfileStore } from "@/components/ProfileStore";

export function UserAvatar() {
  const { avatarUrl, setAvatar } = ProfileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string); 
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border border-gray-200" />
      
      <div className="flex flex-col gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-bold uppercase h-9 px-4 bg-[#1D2F58] hover:bg-[#041942]"
          >
            UPLOAD NEW PHOTO
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setAvatar("/logo_siap.png")}
          >
            RESET
          </Button>
        </div>
        <p className="text-[11px] text-gray-500">Allowed JPG or PNG. Max size 1 MB</p>
      </div>
    </div>
  );
}