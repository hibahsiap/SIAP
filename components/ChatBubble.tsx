import { Plus, Pencil, ArrowUp } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  time: string;
  isSender?: boolean;
  isOPD?: boolean;
  senderName?: string;
  avatar?: string | null;
}

export const ChatBubble = ({ message, time, isSender, isOPD, senderName, avatar }: ChatBubbleProps) => {
  const fallbackName = isSender ? "You" : isOPD ? (senderName ?? "OPD") : (senderName ?? "User");
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=cbd5e1&color=1e293b`;

  return (
    <div className={`flex items-end gap-3 mb-6 ${isSender || isOPD ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar || fallback}
          alt={fallbackName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; }}
        />
      </div>

      <div className={`max-w-[70%] flex flex-col ${isSender || isOPD ? "items-end" : "items-start"}`}>
        <div className="relative group flex items-center gap-2">
          {/* Bubble */}
          <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isSender ? "bg-[#1e293b] text-white rounded-br-none" :
            isOPD ? "bg-[#e0f2fe] text-slate-800 border border-blue-100 rounded-br-none" :
            "bg-[#f1f5f9] text-slate-800 rounded-bl-none"
          }`}>
            <span className="whitespace-pre-wrap">{message}</span>
            <div className={`text-[10px] mt-2 flex items-center gap-1 ${isSender ? "text-slate-400" : "text-slate-500"}`}>
              {time} {isSender && "• You"} {isOPD && senderName && `• Sent by ${senderName}`}
            </div>
          </div>

          {/* Action Buttons (Hover) */}
          {!isSender && !isOPD && (
            <button className="p-1 rounded-full bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={14} />
            </button>
          )}

          {/* Edit/Up Icons for OPD Messages */}
          {isOPD && (
            <div className="flex flex-col gap-1">
              <Pencil size={14} className="text-gray-400" />
              <ArrowUp size={14} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
