"use client";

import { ChatBubble } from "@/components/ChatBubble";
import { ChatHeader } from "@/components/ChatHeader";
import { useInboxStore } from "@/store/useInboxStore";
import { Plus, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState, use } from "react";
import { formatTime } from "@/lib/formatdate";

export default function ChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);

  const {
    current,
    isLoadingDetail,
    detailError,
    fetchConversation,
    sendMessage,
    isSending,
    sendError,
  } = useInboxStore();

  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchConversation(chatId);
  }, [chatId, fetchConversation]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [current?.messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending) return;
    setDraft("");
    await sendMessage(chatId, text);
  };

  if (isLoadingDetail && !current) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Loading conversation…
      </div>
    );
  }

  if (detailError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {detailError}
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Pilih pesan untuk memulai percakapan
      </div>
    );
  }

  const phone = current.citizen.username
    ? `${current.citizen.platform} · @${current.citizen.username}`
    : current.channel.platform;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F9] relative">
      <ChatHeader
        chatId={current.id}
        name={current.citizen.name}
        phone={phone}
        role="OPD"
        avatarUrl={current.citizen.profilePicUrl}
      />

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-6 pb-24 pt-4 custom-scrollbar">
        {current.messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10">
            Belum ada pesan.
          </div>
        ) : (
          current.messages.map((m) => {
            const time = formatTime(m.at);
            if (m.direction === "INBOUND") {
              return (
                <ChatBubble
                  key={m.id}
                  message={m.content}
                  time={time}
                  senderName={current.citizen.name}
                  avatar={current.citizen.profilePicUrl}
                />
              );
            }
            if (m.senderType === "OPD") {
              return (
                <ChatBubble
                  key={m.id}
                  message={m.content}
                  time={time}
                  isOPD
                  senderName={m.sender?.opdName ?? m.sender?.name ?? "OPD"}
                />
              );
            }
            return (
              <ChatBubble
                key={m.id}
                message={m.content}
                time={time}
                isSender
                senderName={m.sender?.name ?? "Admin"}
              />
            );
          })
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-[#F9F9F9]">
        {sendError && (
          <div className="text-xs text-red-500 mb-2 px-2">{sendError}</div>
        )}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
          <button className="text-gray-400 hover:text-slate-600" type="button">
            <Plus size={20} />
          </button>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a response..."
            className="flex-1 bg-transparent outline-none text-sm"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={isSending || !draft.trim()}
            className="bg-[#1e293b] p-2 rounded-full text-white disabled:opacity-50"
            type="button"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
