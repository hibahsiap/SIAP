"use client";

import { ChatBubble } from "@/components/ChatBubble";
import { ChatHeader } from "@/components/ChatHeader";
import { useInboxStore } from "@/store/useInboxStore";
import { Pin, Plus, SendHorizontal, Ticket } from "lucide-react";
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
  const [activeTicketId, setActiveTicketId] = useState<string>("");
  const [readTicketIds, setReadTicketIds] = useState<Set<string>>(new Set());
  const [pinIndex, setPinIndex] = useState(0);

  useEffect(() => {
    fetchConversation(chatId);
    setActiveTicketId("");
    setReadTicketIds(new Set());
    setPinIndex(0);
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

  // Latest pinned first — first click cycles to the most recent pinned message,
  // then keeps moving backwards through older pins and wraps.
  const pinnedMessages = [...current.messages.filter((m) => m.ticket)].reverse();
  const safePinIndex = pinnedMessages.length > 0
    ? pinIndex % pinnedMessages.length
    : 0;
  const currentPin = pinnedMessages[safePinIndex];

  const truncatePreview = (text: string, max = 100) =>
    text.length > max ? `${text.slice(0, max)}...` : text;

  const scrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    // Scroll only within the chat container — never the page.
    const top =
      el.offsetTop - scroller.offsetTop - scroller.clientHeight / 2 + el.clientHeight / 2;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handleCyclePin = () => {
    if (pinnedMessages.length === 0) return;
    const target = pinnedMessages[safePinIndex];
    if (target?.ticket) {
      setActiveTicketId(target.ticket.id);
      setReadTicketIds((prev) => {
        if (prev.has(target.ticket!.id)) return prev;
        const next = new Set(prev);
        next.add(target.ticket!.id);
        return next;
      });
    }
    if (target) scrollToMessage(target.id);
    setPinIndex((idx) => (idx + 1) % pinnedMessages.length);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9F9] relative min-w-0 max-w-full overflow-x-hidden">
      <ChatHeader
        chatId={current.id}
        name={current.citizen.name}
        phone={phone}
        role="OPD"
        avatarUrl={current.citizen.profilePicUrl}
      />

      {currentPin && (
        <div className="px-6 mt-4 mb-1">
          <button
            type="button"
            onClick={handleCyclePin}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-l-4 text-left transition-colors w-full min-w-0 max-w-full ${currentPin.ticket && activeTicketId === currentPin.ticket.id
              ? "bg-amber-100 border-amber-500 ring-1 ring-amber-300"
              : "bg-amber-50 border-amber-400 hover:bg-amber-100"
              }`}
            title={
              pinnedMessages.length > 1
                ? `Pinned (${safePinIndex + 1}/${pinnedMessages.length}) — click to jump, click again for the next pin`
                : "Pinned — click to jump to the source message"
            }
          >
            <Pin size={14} className="text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
                <Ticket size={10} className="flex-shrink-0" />
                <span className="truncate">{currentPin.ticket?.ticketNumber ?? "Ticket"}</span>
                {pinnedMessages.length > 1 && (
                  <span className="text-amber-500 font-normal flex-shrink-0">
                    · {safePinIndex + 1}/{pinnedMessages.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis">
                {truncatePreview(currentPin.content)}
              </p>
            </div>
            {currentPin.ticket && !readTicketIds.has(currentPin.ticket.id) && (
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" aria-label="Unread" />
            )}
          </button>
        </div>
      )}

      <div ref={scrollerRef} className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 px-6 pb-24 pt-4 custom-scrollbar">
        {current.messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10">
            Belum ada pesan.
          </div>
        ) : (
          current.messages.map((m) => {
            const time = formatTime(m.at);
            if (m.direction === "INBOUND") {
              return (
                <div key={m.id} id={`msg-${m.id}`}>
                  <ChatBubble
                    message={m.content}
                    time={time}
                    senderName={current.citizen.name}
                    avatar={current.citizen.profilePicUrl}
                    ticket={m.ticket}
                  />
                </div>
              );
            }
            if (m.senderType === "OPD") {
              return (
                <div key={m.id} id={`msg-${m.id}`}>
                  <ChatBubble
                    message={m.content}
                    time={time}
                    isOPD
                    senderName={m.sender?.opdName ?? m.sender?.name ?? "OPD"}
                  />
                </div>
              );
            }
            return (
              <div key={m.id} id={`msg-${m.id}`}>
                <ChatBubble
                  message={m.content}
                  time={time}
                  isSender
                  senderName={m.sender?.name ?? "Admin"}
                />
              </div>
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
