import { create } from "zustand";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase";

export type InboxPlatform = "WHATSAPP" | "INSTAGRAM" | "FACEBOOK";
export type MessageDirection = "INBOUND" | "OUTBOUND";
export type SenderType = "WARGA" | "ADMIN" | "OPD";
export type TicketStatus =
  | "TO_DO"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "DONE"
  | "CANCELLED";

export type InboxTicketSummary = {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  urgency: string | null;
  type: string | null;
  category: { id: string; name: string } | null;
  assignedOpd: { id: string; name: string } | null;
};

export type InboxConversation = {
  id: string;
  citizen: {
    id: string;
    name: string;
    handle: string | null;
    username: string | null;
    profilePicUrl: string | null;
    platform: InboxPlatform;
  };
  channel: { id: string; platform: InboxPlatform; accountHandle: string | null };
  ticketCount: number;
  lastMessage: {
    content: string;
    direction: MessageDirection;
    senderType: SenderType;
    at: string;
  } | null;
  unread: boolean;
  lastMessageAt: string;
};

export type InboxMessageTicket = {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  urgency: string | null;
  type: string | null;
  assignedOpd: { name: string } | null;
};

export type InboxMessage = {
  id: string;
  content: string;
  direction: MessageDirection;
  senderType: SenderType;
  isInternal: boolean;
  isApproved: boolean;
  forwardedToTicketId: string | null;
  forwardedToOpdName: string | null;
  ticket: InboxMessageTicket | null;
  at: string;
  sender: {
    id: string;
    name: string;
    role: "ADMIN" | "OPD";
    opdName: string | null;
  } | null;
};

export type InboxTicketSummaryDetail = {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  urgency: string | null;
  type: string | null;
  category: { id: string; name: string } | null;
  assignedOpd: { id: string; name: string } | null;
};

export type InboxConversationDetail = Omit<
  InboxConversation,
  "lastMessage" | "unread" | "lastMessageAt" | "ticketCount"
> & {
  tickets: InboxTicketSummaryDetail[];
  messages: InboxMessage[];
};

export type InboxFilters = {
  platform: "all" | "whatsapp" | "instagram" | "unread";
  sort: "newest" | "oldest";
  search: string;
};

interface InboxState {
  conversations: InboxConversation[];
  isLoadingList: boolean;
  listError: string | null;

  current: InboxConversationDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  isSending: boolean;
  sendError: string | null;

  filters: InboxFilters;
  setFilters: (patch: Partial<InboxFilters>) => void;

  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
    opts?: { isInternal?: boolean }
  ) => Promise<void>;

  subscribeRealtime: (role?: "ADMIN" | "OPD") => () => void;
}

function buildQuery(filters: InboxFilters): string {
  const params = new URLSearchParams();
  if (filters.platform === "whatsapp" || filters.platform === "instagram") {
    params.set("platform", filters.platform.toUpperCase());
  }
  if (filters.platform === "unread") {
    params.set("unread", "true");
  }
  if (filters.search.trim()) params.set("search", filters.search.trim());
  params.set("sort", filters.sort);
  return params.toString();
}

export const useInboxStore = create<InboxState>((set, get) => ({
  conversations: [],
  isLoadingList: false,
  listError: null,

  current: null,
  isLoadingDetail: false,
  detailError: null,

  isSending: false,
  sendError: null,

  filters: { platform: "all", sort: "newest", search: "" },

  setFilters: (patch) => {
    set((s) => ({ filters: { ...s.filters, ...patch } }));
    get().fetchConversations();
  },

  fetchConversations: async () => {
    set({ isLoadingList: true, listError: null });
    try {
      const qs = buildQuery(get().filters);
      const res = await fetch(`/api/inbox?${qs}`);
      if (!res.ok) throw new Error("Failed to load inbox");
      const conversations: InboxConversation[] = await res.json();
      set({ conversations, isLoadingList: false });
    } catch (err) {
      set({ listError: (err as Error).message, isLoadingList: false });
    }
  },

  fetchConversation: async (id) => {
    set({ isLoadingDetail: true, detailError: null });
    try {
      const res = await fetch(`/api/inbox/${id}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      const data: InboxConversationDetail = await res.json();
      set({ current: data, isLoadingDetail: false });
    } catch (err) {
      set({ detailError: (err as Error).message, isLoadingDetail: false });
    }
  },

  sendMessage: async (conversationId, content, opts) => {
    set({ isSending: true, sendError: null });
    try {
      const res = await fetch(`/api/inbox/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, isInternal: opts?.isInternal ?? false }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) {
        throw new Error(data?.error ?? "Failed to send message");
      }
      if (data?.deliveryError) set({ sendError: data.deliveryError });
      await get().fetchConversation(conversationId);
      await get().fetchConversations();
    } catch (err) {
      set({ sendError: (err as Error).message });
    } finally {
      set({ isSending: false });
    }
  },

  subscribeRealtime: (role) => {
    let channel: RealtimeChannel | null = null;
    try {
      const supabase = getSupabaseBrowser();
      channel = supabase
        .channel("inbox-stream")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Message" },
          (payload) => {
            const row = payload.new as {
              id: string;
              conversationId: string | null;
              content: string;
              direction: MessageDirection;
              senderType: SenderType;
              isInternal: boolean;
              isApproved: boolean;
              sentAt: string | null;
              createdAt: string;
            };

            const cur = get().current;
            if (cur && row.conversationId === cur.id) {
              if (cur.messages.some((m) => m.id === row.id)) return;
              // OPD must not see arbitrary new messages; re-fetch so the server
              // can apply its role-based filter. Admin can append optimistically.
              if (role === "OPD") {
                get().fetchConversation(cur.id);
              } else {
                set({
                  current: {
                    ...cur,
                    messages: [
                      ...cur.messages,
                      {
                        id: row.id,
                        content: row.content,
                        direction: row.direction,
                        senderType: row.senderType,
                        isInternal: row.isInternal,
                        isApproved: row.isApproved,
                        forwardedToTicketId: null,
                        forwardedToOpdName: null,
                        ticket: null,
                        at: row.sentAt ?? row.createdAt,
                        sender: null,
                      },
                    ],
                  },
                });
              }
            }

            get().fetchConversations();
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Conversation" },
          () => get().fetchConversations()
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "Conversation" },
          () => get().fetchConversations()
        )
        .subscribe();
    } catch (err) {
      console.warn("[Realtime] Disabled:", (err as Error).message);
    }

    return () => {
      if (channel) {
        const supabase = getSupabaseBrowser();
        supabase.removeChannel(channel);
      }
    };
  },
}));
