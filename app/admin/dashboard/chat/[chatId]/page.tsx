"use client";

import { ChatBubble } from "@/components/ChatBubble";
import { ChatHeader } from "@/components/ChatHeader";
import { useInboxStore } from "@/store/useInboxStore";
import { Plus, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState, use } from "react";
import CreateTicketFromChatModal from "@/components/CreateTicketFromChatModal";
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
    sendMessage,
    isSending,
    sendError,
  } = useInboxStore();

  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

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

  // Message selection for forwarding
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardError, setForwardError] = useState<string | null>(null);

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
  };

  const handleToggleMessageSelect = (messageId: string) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const handleForward = async () => {
    if (selectedMessageIds.size === 0 || !selectedTicketId) return;
    setIsForwarding(true);
    setForwardError(null);
    try {
      const res = await fetch(`/api/inbox/${chatId}/forward`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageIds: Array.from(selectedMessageIds),
          ticketId: selectedTicketId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Forward gagal");
      setIsSelectMode(false);
      setSelectedMessageIds(new Set());
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

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <ChatHeader
        chatId={current.id}
        name={current.citizen.name}
        phone={phone}
        role="ADMIN"
        avatarUrl={current.citizen.profilePicUrl}
        tickets={current.tickets}
        selectedTicketId={selectedTicketId}
        onSelectTicket={setSelectedTicketId}
        isSelectMode={isSelectMode}
        selectedCount={selectedMessageIds.size}
        isForwarding={isForwarding}
        onToggleSelectMode={handleToggleSelectMode}
        onForward={handleForward}
      />

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-24 custom-scrollbar">
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
              return (
                <div key={m.id}>
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
                    onToggleSelect={() => handleToggleMessageSelect(m.id)}
                  />
                </div>
              );
            }
            if (m.senderType === "OPD") {
              return (
                <div key={m.id}>
                  {dateSep}
                  <ChatBubble
                    message={m.content}
                    time={time}
                    isOPD
                    senderName={m.sender?.opdName ?? m.sender?.name ?? "OPD"}
                    isApproved={m.isApproved}
                    onEditApprove={!m.isApproved ? async (content) => {
                      await fetch(`/api/inbox/${chatId}/messages/${m.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content, approve: true }),
                      });
                      fetchConversation(chatId);
                    } : undefined}
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
                  onToggleSelect={() => handleToggleMessageSelect(m.id)}
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
