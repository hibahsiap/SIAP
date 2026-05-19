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
  unread?: boolean;
}

export const ChatItem = ({ 
  name, message, time, status, statusColor, 
  category, categoryColor, department, platform, flagColor, isActive, unread
}: ChatItemProps) => {
  return (
    <div className={`p-4 border-b cursor-pointer transition-all ${isActive ? 'bg-gray-200/75' : 'bg-white hover:bg-gray-200/75'}`}>
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
            
            {/* Waktu & Icon */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[11px] text-gray-400 mb-2">{time}</span>
              <div className="w-6 flex justify-center"> {/* Fixed width agar sejajar dengan bulatan di bawah */}
                {platform === 'whatsapp' ? (
                  <div className="text-green-500">
                    <Image src="/images/whatsapp-icon.png" width={18} height={18} alt="WA" />
                  </div>
                ) : (
                  <div className="text-pink-500">
                    <Image src="/images/instagram-icon.png" width={16} height={16} alt="IG" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Badges & Unread Indicator */}
          <div className="flex items-center justify-between mt-3">
            {/* Badge */}
            <div className="flex flex-wrap gap-2">
              <Badge className={statusColor}>
                <span className="mr-1 text-[8px]">●</span>{status}
              </Badge>
              <Badge className={categoryColor}>
                {category}
              </Badge>
              <Badge className="bg-[#F0DFAC] text-[#655121]">
                {department}
              </Badge>
            </div>

            {/* Unread Indicator */}
            <div className="w-6 flex justify-center flex-shrink-0">
              {unread && (
                <div className="w-2 h-2 bg-[#4ADE80] rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};