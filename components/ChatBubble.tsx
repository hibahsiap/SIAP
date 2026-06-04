import { Plus, Pencil, ArrowUp, Check, Forward, Ticket, Loader2, X, FileText, Download, Ban } from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  TO_DO: "To Do", IN_PROGRESS: "In Progress", ON_HOLD: "On Hold", DONE: "Done", CANCELLED: "Cancelled",
};
const STATUS_COLOR: Record<string, string> = {
  TO_DO: "bg-red-100 text-red-700", IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700", DONE: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};
const URGENCY_COLOR: Record<string, string> = {
  LOW: "bg-green-100 text-green-700", MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700", CRITICAL: "bg-red-100 text-red-700",
};
const TYPE_COLOR: Record<string, string> = {
  COMPLAINT: "bg-pink-100 text-pink-700", FEEDBACK: "bg-purple-100 text-purple-700",
  QUESTION: "bg-orange-100 text-orange-700",
};

type TicketBadge = {
  id: string;
  ticketNumber: string;
  status: string;
  urgency: string | null;
  type: string | null;
  assignedOpd: { name: string } | null;
};

type BubbleAttachment = {
  id: string;
  url: string;
  mimeType: string;
  fileName: string;
};

interface ChatBubbleProps {
  message: string;
  time: string;
  isSender?: boolean;
  isOPD?: boolean;
  senderName?: string;
  avatar?: string | null;
  onCreateTicket?: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (opts?: { shift?: boolean }) => void;
  ticket?: TicketBadge | null;
  forwardedToTicketId?: string | null;
  forwardedToOpdName?: string | null;
  isClassifying?: boolean;
  isApproved?: boolean;
  onEditApprove?: (content: string) => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  approval?: { verdict: string; reason: string | null } | null;
  attachments?: BubbleAttachment[];
}

export const ChatBubble = ({
  message, time, isSender, isOPD, senderName, avatar,
  onCreateTicket, isSelectMode, isSelected, onToggleSelect,
  ticket, forwardedToTicketId, forwardedToOpdName, isClassifying,
  isApproved = true, onEditApprove, onReject, approval, attachments,
}: ChatBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<BubbleAttachment | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isRejected = approval?.verdict === "REJECTED";
  const isPending = isOPD && !isApproved && !isRejected;

  const handleDownload = async (a: BubbleAttachment) => {
    try {
      const res = await fetch(a.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = a.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(a.url, "_blank");
    }
  };

  useEffect(() => {
    if (!previewAttachment) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewAttachment(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewAttachment]);

  const fallbackName = isSender ? "You" : isOPD ? (senderName ?? "OPD") : (senderName ?? "User");
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=cbd5e1&color=1e293b`;

  const isInbound = !isSender && !isOPD;

  const canSelect = isSelectMode && !forwardedToTicketId && (isInbound || isSender);

  return (
    <>
      <div className="flex items-center gap-3 mb-4 min-w-0 max-w-full">
        {/* Select-mode checkbox — always on the far left, regardless of sender direction */}
        {isSelectMode && (
          <div className="flex-shrink-0 w-5">
            {canSelect && (
              <button
                onClick={(e) => onToggleSelect?.({ shift: e.shiftKey })}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-[#1e293b] border-[#1e293b]" : "bg-white border-gray-400"
                  }`}
              >
                {isSelected && <Check size={12} className="text-white" />}
              </button>
            )}
          </div>
        )}

        <div className={`flex-1 min-w-0 flex items-end gap-3 ${isSender || isOPD ? "flex-row-reverse" : "flex-row"}`}>
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

          <div className={`max-w-[70%] min-w-0 flex flex-col gap-1 ${isSender || isOPD ? "items-end" : "items-start"}`}>
            {/* Ticket badge — shown when this message created a ticket */}
            {ticket && isInbound && (
              <div className="flex flex-wrap items-center gap-1.5 px-1">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600">
                  <Ticket size={10} /> {ticket.ticketNumber}
                </span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLOR[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABEL[ticket.status] ?? ticket.status}
                </span>
                {ticket.urgency && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${URGENCY_COLOR[ticket.urgency] ?? "bg-gray-100 text-gray-600"}`}>
                    {ticket.urgency}
                  </span>
                )}
                {ticket.type && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${TYPE_COLOR[ticket.type] ?? "bg-gray-100 text-gray-600"}`}>
                    {ticket.type}
                  </span>
                )}
                {ticket.assignedOpd && (
                  <span className="text-[10px] text-slate-500">{ticket.assignedOpd.name}</span>
                )}
              </div>
            )}

            {/* Forwarded badge — shown only when forwarded but NOT a ticket trigger */}
            {forwardedToTicketId && !ticket && isInbound && (
              <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium px-1">
                <Forward size={10} /> Forwarded to {forwardedToOpdName ?? "OPD"}
              </span>
            )}

            <div className="relative group flex items-center gap-2">
              {/* Bubble */}
              {isEditing ? (
                <div className="flex flex-col gap-2 max-w-[340px]">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-blue-300 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-600"
                    >
                      <X size={12} /> Cancel
                    </button>
                    <button
                      disabled={isSubmitting || !editContent.trim()}
                      onClick={async () => {
                        setIsSubmitting(true);
                        await onEditApprove!(editContent.trim());
                        setIsEditing(false);
                        setIsSubmitting(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <ArrowUp size={12} />}
                      Approve & Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isSender ? "bg-[#1e293b] text-white rounded-br-none" :
                    isOPD && isRejected ? "bg-red-50 text-slate-600 border border-red-200 rounded-br-none opacity-60" :
                      isOPD && isPending ? "bg-[#e0f2fe] text-slate-800 border border-blue-200 border-dashed rounded-br-none opacity-70" :
                        isOPD ? "bg-[#e0f2fe] text-slate-800 border border-blue-100 rounded-br-none" :
                          ticket ? "bg-[#f1f5f9] text-slate-800 rounded-bl-none ring-1 ring-slate-300" :
                            "bg-[#f1f5f9] text-slate-800 rounded-bl-none"
                  }`}>
                  {attachments && attachments.length > 0 && (
                    <div className={`flex flex-col gap-2 ${message ? "mb-2" : ""}`}>
                      {attachments.map((a) => {
                        if (a.mimeType.startsWith("image/")) {
                          return (
                            <div key={a.id} className="relative group/img inline-block">
                              <button
                                type="button"
                                onClick={() => setPreviewAttachment(a)}
                                className="block cursor-zoom-in"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={a.url}
                                  alt={a.fileName}
                                  loading="lazy"
                                  className="max-w-[260px] max-h-[260px] rounded-lg object-cover"
                                />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDownload(a); }}
                                className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          );
                        }
                        return (
                          <a
                            key={a.id}
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isSender ? "bg-white/10 text-white" : "bg-white/70 text-slate-700"
                              }`}
                          >
                            <FileText size={14} className="flex-shrink-0" />
                            <span className="truncate">{a.fileName}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                  {message && (
                    <span className="whitespace-pre-wrap break-all">{message}</span>
                  )}
                  <div className={`text-[10px] mt-2 flex items-center gap-1 ${isSender ? "text-slate-400" : "text-slate-500"}`}>
                    {time} {isSender && "• You"} {isOPD && senderName && `• Sent by ${senderName}`}
                    {isPending && <span className="ml-1 text-amber-500 font-semibold">• Pending approval</span>}
                    {isRejected && (
                      <span className="ml-1 text-red-500 font-semibold">
                        • Rejected{approval?.reason ? ` — ${approval.reason}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isInbound && !isSelectMode && onCreateTicket && !ticket && !forwardedToTicketId && (
                <button
                  onClick={onCreateTicket}
                  disabled={isClassifying}
                  className="p-1 rounded-full bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                >
                  {isClassifying
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Plus size={14} />
                  }
                </button>
              )}
              {/* Edit/Approve/Reject for unapproved OPD messages (admin only) */}
              {isOPD && isPending && onEditApprove && (
                <div className="flex flex-col gap-1">
                  {isRejecting ? (
                    <div className="flex flex-col gap-2 w-[200px] bg-white border border-red-200 rounded-xl p-3 shadow-sm">
                      <label className="text-[11px] font-semibold text-red-600 uppercase">Reject Reason</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Required…"
                        className="w-full p-2 rounded-lg border border-red-200 text-xs resize-none outline-none focus:ring-2 focus:ring-red-300 min-h-[50px]"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setIsRejecting(false); setRejectReason(""); }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-600"
                        >
                          <X size={12} /> Cancel
                        </button>
                        <button
                          disabled={isSubmitting || !rejectReason.trim()}
                          onClick={async () => {
                            setIsSubmitting(true);
                            await onReject?.(rejectReason.trim());
                            setIsRejecting(false);
                            setRejectReason("");
                            setIsSubmitting(false);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : "Reject"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsEditing(true); setEditContent(message); }}
                        className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        disabled={isSubmitting}
                        onClick={async () => {
                          setIsSubmitting(true);
                          await onEditApprove(message);
                          setIsSubmitting(false);
                        }}
                        className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 disabled:opacity-50"
                        title="Approve & Send"
                      >
                        {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} />}
                      </button>
                      {onReject && (
                        <button
                          disabled={isSubmitting}
                          onClick={() => setIsRejecting(true)}
                          className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 disabled:opacity-50"
                          title="Reject"
                        >
                          <Ban size={13} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewAttachment && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewAttachment(null)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload(previewAttachment)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreviewAttachment(null); }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewAttachment.url}
            alt={previewAttachment.fileName}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
};
