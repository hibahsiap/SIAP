import { Flag } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "./Badge";

interface ChatItemProps {
  name: string;
  message: string;
  time: string;
  ticketCount: number;
  platform: 'whatsapp' | 'instagram';
  flagColor: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  unreadCount?: number;
}

export const ChatItem = ({
  name, message, time, ticketCount, platform, flagColor, avatarUrl, isActive, unreadCount
}: ChatItemProps) => {
  const [imgError, setImgError] = useState(false);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D3B66&color=fff`;
  const currentAvatar = imgError || !avatarUrl ? fallbackAvatar : avatarUrl;

  return (
    <div className={`p-4 border-b cursor-pointer transition-all ${isActive ? 'bg-gray-200/75' : 'bg-white hover:bg-gray-200/75'}`}>
      <div className="flex gap-3">
        {/* Avatar & Flag Area */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 relative mb-3 bg-slate-100 flex-shrink-0">
            <img
              src={currentAvatar}
              alt={name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          </div>
          {/* <Flag size={15} className={`${flagColor} fill-current`} /> */}
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
              {ticketCount === 0 ? (
                <Badge className="bg-gray-100 text-gray-500">
                  No Ticket
                </Badge>
              ) : (
                <Badge className="bg-blue-100 text-blue-700">
                  {ticketCount} Ticket{ticketCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            {/* Unread Indicator */}
            <div className="w-6 flex justify-center flex-shrink-0">
              {unreadCount !== undefined && unreadCount > 0 && !isActive ? (
                <div className="min-w-5 h-5 px-1.5 bg-[#2962C0] rounded-full text-white text-[11px] flex items-center justify-center font-semibold shadow-sm ring-2 ring-white">
                  {unreadCount}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};