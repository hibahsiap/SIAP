import { Plus, Pencil, ArrowUp } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  time: string;
  isSender?: boolean;
  isOPD?: boolean;
  senderName?: string;
  avatar?: string;
}

export const ChatBubble = ({ message, time, isSender, isOPD, senderName, avatar }: ChatBubbleProps) => {
  return (
    <div className={`flex items-end gap-3 mb-6 ${isSender || isOPD ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
        <img src={avatar || `https://ui-avatars.com/api/?name=${senderName || "User"}`} alt="avatar" />
      </div>

      <div className={`max-w-[70%] flex flex-col ${isSender || isOPD ? "items-end" : "items-start"}`}>
        <div className="relative group flex items-center gap-2">
          {/* Action Buttons (Hover) */}
          {!isSender && !isOPD && (
            <button className="p-1 rounded-full bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={14} />
            </button>
          )}

          {/* Bubble */}
          <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isSender ? "bg-[#1e293b] text-white rounded-br-none" : 
            isOPD ? "bg-[#e0f2fe] text-slate-800 border border-blue-100 rounded-br-none" : 
            "bg-[#f1f5f9] text-slate-800 rounded-bl-none"
          }`}>
            {message}
            <div className={`text-[10px] mt-2 flex items-center gap-1 ${isSender ? "text-slate-400" : "text-slate-500"}`}>
              {time} {isSender && "• You"} {isOPD && `• Sent by ${senderName}`}
            </div>
          </div>

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