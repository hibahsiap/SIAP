"use client";

import { ChatBubble } from "@/components/ChatBubble";
import { ChatHeader } from "@/components/ChatHeader";
import { useInboxStore } from "@/store/useInboxStore";
import { Pin, Plus, SendHorizontal, Ticket, X as XIcon, Loader2 as Spinner } from "lucide-react";
import { useEffect, useRef, useState, use } from "react";
import { formatTime } from "@/lib/formatdate";
import FileAttachment from "@/components/FileAttachment";

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

  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    url: string;
    mimeType: string;
    fileName: string;
    sizeBytes: number;
    previewUrl: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Reset per-conversation UI state when the route param changes, computed during
  // render to avoid a synchronous setState inside an effect.
  const [prevChatId, setPrevChatId] = useState(chatId);
  if (chatId !== prevChatId) {
    setPrevChatId(chatId);
    setActiveTicketId("");
    setReadTicketIds(new Set());
    setPinIndex(0);
  }

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
    if (isSending || isUploading) return;
    if (!text && !pendingAttachment) return;
    const snapshotAttachment = pendingAttachment
      ? {
        url: pendingAttachment.url,
        mimeType: pendingAttachment.mimeType,
        fileName: pendingAttachment.fileName,
        sizeBytes: pendingAttachment.sizeBytes,
      }
      : undefined;
    setDraft("");
    setPendingAttachment(null);
    await sendMessage(chatId, text, snapshotAttachment ? { attachment: snapshotAttachment } : undefined);
  };

  const handleFilePicked = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/inbox/${chatId}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPendingAttachment({
        url: data.url,
        mimeType: data.mimeType,
        fileName: data.fileName,
        sizeBytes: data.sizeBytes,
        previewUrl: URL.createObjectURL(file),
      });
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingDetail && !current) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner className="w-8 h-8 animate-spin text-[#1D2F58]" />
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

  const returnableTickets = Array.from(
    new Map(
      current.messages
        .filter((m) => m.ticket && !["DONE", "CANCELLED", "ON_HOLD"].includes(m.ticket.status))
        .map((m) => [m.ticket!.id, { id: m.ticket!.id, ticketNumber: m.ticket!.ticketNumber }])
    ).values()
  );

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
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#F9F9F9] relative min-w-0 max-w-full overflow-x-hidden">
      <ChatHeader
        chatId={current.id}
        name={current.citizen.name}
        phone={phone}
        role="OPD"
        avatarUrl={current.citizen.profilePicUrl}
        tickets={returnableTickets}
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

      <div ref={scrollerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden min-w-0 px-6 pb-4 pt-4 custom-scrollbar">
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
                    attachments={m.attachments}
                    replyTo={m.replyTo}
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
                    isApproved={m.isApproved}
                    approval={m.approval}
                    attachments={m.attachments}
                    replyTo={m.replyTo}
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
                  attachments={m.attachments}
                  replyTo={m.replyTo}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="shrink-0 w-full p-4 bg-[#F9F9F9]">
        {(sendError || uploadError) && (
          <div className="text-xs text-red-500 mb-2 px-2">{sendError ?? uploadError}</div>
        )}
        {pendingAttachment && (
          <div className="mb-2 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1.5 pr-2 shadow-sm">
            {pendingAttachment.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pendingAttachment.previewUrl}
                alt={pendingAttachment.fileName}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                FILE
              </div>
            )}
            <span className="text-xs text-slate-700 max-w-[160px] truncate">
              {pendingAttachment.fileName}
            </span>
            <button
              type="button"
              onClick={() => setPendingAttachment(null)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Remove attachment"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAttachmentMenuOpen((v) => !v)}
              disabled={isUploading}
              className="text-gray-400 hover:text-slate-600 disabled:opacity-50"
            >
              {isUploading ? <Spinner size={20} className="animate-spin" /> : <Plus size={20} />}
            </button>
            <div className="absolute bottom-full left-0 mb-2">
              <FileAttachment
                isOpen={attachmentMenuOpen}
                onClose={() => setAttachmentMenuOpen(false)}
                onFileSelect={(file) => handleFilePicked(file)}
              />
            </div>
          </div>
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
            disabled={isSending || isUploading || (!draft.trim() && !pendingAttachment)}
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
