// components/ChatItem.tsx
import { Flag } from "lucide-react";
import Image from "next/image";
import { Badge } from "./Badge";

interface ChatItemProps {
  name: string;
  message: string;
  time: string;
  status: string;
  statusColor: string;
  category: string;
  categoryColor: string;
  department: string;
  platform: 'whatsapp' | 'instagram';
  flagColor: string; 
  isActive?: boolean;
}

export const ChatItem = ({ 
  name, message, time, status, statusColor, 
  category, categoryColor, department, platform, flagColor, isActive 
}: ChatItemProps) => {
  return (
    <div className={`p-4 border-b cursor-pointer transition-all ${isActive ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}>
      <div className="flex gap-3">
        {/* Avatar & Flag Area */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 relative mb-3">
            <img 
              src={`https://ui-avatars.com/api/?name=${name}&background=0D3B66&color=fff`} 
              alt={name}
              className="object-cover"
            />
          </div>
          <Flag size={15} className={`${flagColor} fill-current`} />
        </div>

        {/* Text Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <h4 className="text-[15px] font-bold text-slate-900 leading-tight truncate">{name}</h4>
              <p className="text-[13px] text-gray-500 mt-1 truncate">{message}</p>
            </div>
            
            <div className="flex flex-col items-end flex-shrink-0 gap-2">
              <span className="text-[11px] text-gray-400">{time}</span>
              {platform === 'whatsapp' ? (
                <div className="text-green-500"><Image src="/images/whatsapp-icon.png" width={18} height={18} alt="WA" /></div>
              ) : (
                <div className="text-pink-500"><Image src="/images/instagram-icon.png" width={15} height={15} alt="IG" /></div>
              )}
            </div>
          </div>

          {/* Badges Area */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={statusColor}>
              <span className="mr-1">●</span>{status}
            </Badge>
            <Badge className={categoryColor}>
              {category}
            </Badge>
            <Badge className="bg-gray-200 text-gray-700">
              {department}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};