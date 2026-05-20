"use client";

import { Plus, Pencil, ArrowUp} from "lucide-react";
import { InteractionStore } from "./InteractionStore";
import CreateDeleteModals from "@/components/SocialModal";
import { useChatStore } from "@/constants/chatStore";

interface ChatBubbleProps {
  id: string;
  message: string;
  time: string;
  isSender?: boolean;
  isOPD?: boolean;
  senderName?: string;
  avatar?: string;
  isAdminPage?: boolean;
}

export const ChatBubble = ({ id, message, time, isSender, isOPD, senderName, avatar, isAdminPage }: ChatBubbleProps) => {
  const { openCreateTicketModal } = InteractionStore();
  const { setEditingMessage, forwardMessage, editingMessage } = useChatStore();

  const isBeingEdited = editingMessage?.id === id;

  return (
    <div className={`flex items-end gap-3 mb-6 ${isSender || isOPD ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
        <img src={avatar || `https://ui-avatars.com/api/?name=${senderName || "User"}`} alt="avatar" />
      </div>

      <div className={`max-w-[70%] flex flex-col ${isSender || isOPD ? "items-end" : "items-start"}`}>
        <div className="relative group flex items-center gap-2">

          {/* Edit/Up Icons for OPD Messages */}
          {isAdminPage && isOPD && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  setEditingMessage({ id, originalMessage: message })
                }
                className={`p-1 rounded-full transition-colors ${
                  isBeingEdited
                    ? "text-blue-500 bg-blue-50"
                    : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                }`}
                title="Edit pesan"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => forwardMessage(id)}
                className="p-1 rounded-full text-gray-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Forward pesan"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          )}

          {/* Bubble */}
          <div
            className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
              isSender
                ? "bg-[#1e293b] text-white rounded-br-none"
                : isOPD
                ? `bg-[#e0f2fe] text-slate-800 border rounded-br-none ${
                    isBeingEdited
                      ? "border-blue-400 ring-2 ring-blue-200"
                      : "border-blue-100"
                  }`
                : "bg-[#f1f5f9] text-slate-800 rounded-bl-none"
            }`}
          >
            {message}
            <div
              className={`text-[10px] mt-2 flex items-center gap-1 ${
                isSender ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {time} {isSender && "• Sent by Admin"}{" "}
              {isOPD && `• Sent by ${senderName}`}
            </div>
          </div>

          {/* Action Buttons (Hover) for regular messages */}
          {!isSender && !isOPD && isAdminPage && (
            <button
              onClick={() => openCreateTicketModal({ message }, "message")}
              className="p-1 rounded-full bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus size={14} />
            </button>
          )}

          <CreateDeleteModals />
        </div>
      </div>
    </div>
  );
};