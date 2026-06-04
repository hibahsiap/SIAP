"use client";

import { ChatBubble } from "@/components/ChatBubble";
import { ChatHeader } from "@/components/ChatHeader";
import { useInboxStore } from "@/store/useInboxStore";
import { Pin, Plus, SendHorizontal, Ticket, X as XIcon, Loader2 as Spinner } from "lucide-react";
import { useEffect, useRef, useState, use } from "react";
import CreateTicketFromChatModal from "@/components/CreateTicketFromChatModal";
import FileAttachment from "@/components/FileAttachment";
import { formatTime, formatDateLabel, dayKey } from "@/lib/formatdate";

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
    fetchConversations,
    sendMessage,
    isSending,
    sendError,
    markAsRead,
  } = useInboxStore();

  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
  const initializedChatId = useRef<string | null>(null);

  // Outbound attachment composer state. We upload immediately on file pick so the
  // user gets a preview thumbnail; the URL is held until Send fires.
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

  // Ticket creation modal
  const [createTicketModal, setCreateTicketModal] = useState<{
    messageId: string;
    messagePreview: string;
    aiResult?: {
      title?: string | null;
      description?: string | null;
      type?: string | null;
      urgency?: string | null;
      location?: string | null;
      category?: string | null;
    };
  } | null>(null);
  const [classifyingMessageId, setClassifyingMessageId] = useState<string | null>(null);

  // Track which ticket pins the admin has visited in this session so we can render
  // an "unread" dot on the rest. Resets when the conversation changes.
  const [readTicketIds, setReadTicketIds] = useState<Set<string>>(new Set());
  // Cycling index into the pinned-messages list. Each click advances it.
  const [pinIndex, setPinIndex] = useState(0);

  // Message selection for forwarding
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [opds, setOpds] = useState<{ id: string; name: string }[]>([]);
  const [selectedOpdId, setSelectedOpdId] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardError, setForwardError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversation(chatId);
    setReadTicketIds(new Set());
    setSelectedOpdId("");
    setPinIndex(0);
    initializedChatId.current = null;
    setFirstUnreadId(null);
  }, [chatId, fetchConversation]);

  useEffect(() => {
    fetch("/api/opd")
      .then((res) => res.json())
      .then((data) => setOpds(data))
      .catch((err) => console.error("Failed to load OPDs", err));
  }, []);

  useEffect(() => {
    if (current && current.id === chatId && initializedChatId.current !== chatId) {
      initializedChatId.current = chatId;
      const unreadMsg = current.messages.find(m => m.direction === "INBOUND" && !m.isRead);
      if (unreadMsg) {
        setFirstUnreadId(unreadMsg.id);
      }
      // Always call markAsRead so that we clear any lingering unread states 
      // (even if no messages matched the query, the API will just run a no-op update)
      markAsRead(chatId);
    }
  }, [current, chatId, markAsRead]);

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

  const handleOpenCreateTicket = async (messageId: string, content: string) => {
    setClassifyingMessageId(messageId);
    try {
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const aiResult = res.ok ? await res.json() : {};
      setCreateTicketModal({ messageId, messagePreview: content, aiResult });
    } catch {
      setCreateTicketModal({ messageId, messagePreview: content });
    } finally {
      setClassifyingMessageId(null);
    }
  };

  const handleToggleSelectMode = () => {
    setIsSelectMode((prev) => !prev);
    setSelectedMessageIds(new Set());
    setLastSelectedId(null);
  };

  // Only messages that the bubble actually allows selecting (inbound or admin outbound, not forwarded).
  const selectableMessages = (current?.messages ?? []).filter(
    (m) =>
      !m.forwardedToTicketId &&
      !m.forwardedToOpdId &&
      (m.direction === "INBOUND" || m.senderType === "ADMIN")
  );

  const handleToggleMessageSelect = (
    messageId: string,
    opts?: { shift?: boolean }
  ) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);

      if (opts?.shift && lastSelectedId && lastSelectedId !== messageId) {
        const startIdx = selectableMessages.findIndex((m) => m.id === lastSelectedId);
        const endIdx = selectableMessages.findIndex((m) => m.id === messageId);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          // Range selection picks the action based on the new anchor: if it's currently
          // unselected, the whole range becomes selected; otherwise the range is cleared.
          const shouldSelect = !next.has(messageId);
          for (let i = from; i <= to; i++) {
            const id = selectableMessages[i].id;
            if (shouldSelect) next.add(id);
            else next.delete(id);
          }
          return next;
        }
      }

      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
    setLastSelectedId(messageId);
  };

  const handleForward = async () => {
    if (selectedMessageIds.size === 0 || !selectedOpdId) return;
    setIsForwarding(true);
    setForwardError(null);
    try {
      const res = await fetch(`/api/inbox/${chatId}/forward`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageIds: Array.from(selectedMessageIds),
          opdId: selectedOpdId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Forward gagal");
      if (data?.forwarded === 0) {
        // Nothing actually updated — usually because every selected message was
        // already forwarded. Surface that instead of silently closing select mode.
        throw new Error("No messages were forwarded (already forwarded?)");
      }
      setIsSelectMode(false);
      setSelectedMessageIds(new Set());
      setLastSelectedId(null);
      // Forwarding is an UPDATE on existing messages, so the realtime listener
      // (INSERT-only) won't push it. Refetch so the badges and pinned list update.
      await fetchConversation(chatId);
      fetchConversations();
    } catch (err) {
      setForwardError((err as Error).message);
    } finally {
      setIsForwarding(false);
    }
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

  // ⚙️ Truncate setting for the pinned preview text.
  // Change `max` here to control how many characters are shown before "...".
  const truncatePreview = (text: string, max = 100) =>
    text.length > max ? `${text.slice(0, max)}...` : text;

  const scrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    // Scroll only within the chat container — never the page — by computing the
    // target offset relative to the scroller and centering it.
    const top =
      el.offsetTop - scroller.offsetTop - scroller.clientHeight / 2 + el.clientHeight / 2;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handleCyclePin = () => {
    if (pinnedMessages.length === 0) return;
    const target = pinnedMessages[safePinIndex];
    if (target?.ticket) {
      setReadTicketIds((prev) => {
        if (prev.has(target.ticket!.id)) return prev;
        const next = new Set(prev);
        next.add(target.ticket!.id);
        return next;
      });
    }
    if (target) scrollToMessage(target.id);
    // Advance so the next click cycles to the older pinned message, wrapping at the end.                                            
    setPinIndex((idx) => (idx + 1) % pinnedMessages.length);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative min-w-0 max-w-full overflow-x-hidden">
      <ChatHeader
        chatId={current.id}
        name={current.citizen.name}
        phone={phone}
        role="ADMIN"
        avatarUrl={current.citizen.profilePicUrl}
        opds={opds}
        selectedOpdId={selectedOpdId}
        onSelectOpd={setSelectedOpdId}
        isSelectMode={isSelectMode}
        selectedCount={selectedMessageIds.size}
        isForwarding={isForwarding}
        onToggleSelectMode={handleToggleSelectMode}
        onForward={handleForward}
      />

      {currentPin && (
        <div className="px-6 mt-4 mb-1">
          <button
            type="button"
            onClick={handleCyclePin}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-l-4 text-left transition-colors w-full min-w-0 max-w-full bg-amber-50 border-amber-400 hover:bg-amber-100`}
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
                {currentPin.ticket?.assignedOpd && (
                  <span className="text-amber-500 font-normal truncate">
                    · {currentPin.ticket.assignedOpd.name}
                  </span>
                )}
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

      <div ref={scrollerRef} className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 px-6 pt-6 pb-24 custom-scrollbar">
        {forwardError && (
          <div className="py-2 text-xs text-red-500">{forwardError}</div>
        )}

        {current.messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10">
            Belum ada pesan.
          </div>
        ) : (
          current.messages.map((m, i) => {
            const time = formatTime(m.at);
            const showDateSep = i === 0 || dayKey(m.at) !== dayKey(current.messages[i - 1].at);
            const dateSep = showDateSep ? (
              <div key={`sep-${m.id}`} className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[11px] text-gray-400 font-medium px-2">{formatDateLabel(m.at)}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            ) : null;

            if (m.direction === "INBOUND") {
              const showUnreadDivider = firstUnreadId === m.id;
              return (
                <div key={m.id} id={`msg-${m.id}`}>
                  {showUnreadDivider && (
                    <div className="flex items-center gap-3 my-6">
                      <div className="flex-1 h-px bg-[#5B6F9C]/30" />
                      <span className="text-[11px] text-[#2962C0] font-bold px-3 py-1 bg-[#2962C0]/10 rounded-md uppercase tracking-wider">
                        Unread messages
                      </span>
                      <div className="flex-1 h-px bg-[#5B6F9C]/30" />
                    </div>
                  )}
                  {dateSep}
                  <ChatBubble
                    message={m.content}
                    time={time}
                    senderName={current.citizen.name}
                    avatar={current.citizen.profilePicUrl}
                    ticket={m.ticket}
                    forwardedToTicketId={m.forwardedToTicketId}
                    forwardedToOpdName={m.forwardedToOpdName}
                    onCreateTicket={
                      !isSelectMode
                        ? () => handleOpenCreateTicket(m.id, m.content)
                        : undefined
                    }
                    isClassifying={classifyingMessageId === m.id}
                    isSelectMode={isSelectMode}
                    isSelected={selectedMessageIds.has(m.id)}
                    onToggleSelect={(opts) => handleToggleMessageSelect(m.id, opts)}
                    attachments={m.attachments}
                    replyTo={m.replyTo}
                  />
                </div>
              );
            }
            if (m.senderType === "OPD") {
              return (
                <div key={m.id} id={`msg-${m.id}`}>
                  {dateSep}
                  <ChatBubble
                    message={m.content}
                    time={time}
                    isOPD
                    senderName={m.sender?.opdName ?? m.sender?.name ?? "OPD"}
                    isApproved={m.isApproved}
                    approval={m.approval}
                    onEditApprove={!m.isApproved ? async (content) => {
                      await fetch(`/api/inbox/${chatId}/messages/${m.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content, approve: true }),
                      });
                      fetchConversation(chatId);
                    } : undefined}
                    onReject={!m.isApproved ? async (reason: string) => {
                      await fetch(`/api/inbox/${chatId}/messages/${m.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reject: true, reason }),
                      });
                      fetchConversation(chatId);
                    } : undefined}
                    attachments={m.attachments}
                    replyTo={m.replyTo}
                  />
                </div>
              );
            }
            return (
              <div key={m.id}>
                {dateSep}
                <ChatBubble
                  message={m.content}
                  time={time}
                  isSender
                  senderName={m.sender?.name ?? "Admin"}
                  isSelectMode={isSelectMode}
                  isSelected={selectedMessageIds.has(m.id)}
                  onToggleSelect={(opts) => handleToggleMessageSelect(m.id, opts)}
                  attachments={m.attachments}
                  replyTo={m.replyTo}
                />
              </div>
            );
          })
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-[#F9F9F9]">
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
            <FileAttachment
              isOpen={attachmentMenuOpen}
              onClose={() => setAttachmentMenuOpen(false)}
              onFileSelect={(file) => handleFilePicked(file)}
            />
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

      {createTicketModal && (
        <CreateTicketFromChatModal
          isOpen={true}
          conversationId={chatId}
          messageId={createTicketModal.messageId}
          messagePreview={createTicketModal.messagePreview}
          aiResult={createTicketModal.aiResult}
          onClose={() => setCreateTicketModal(null)}
          onCreated={() => {
            fetchConversation(chatId);
            setCreateTicketModal(null);
          }}
        />
      )}
    </div>
  );
}
