import { create } from "zustand";

export interface ChatMessage {
  id: string;
  message: string;
  time: string;
  isSender?: boolean;
  isOPD?: boolean;
  senderName?: string;
}

interface EditingMessage {
  id: string;
  originalMessage: string;
}

interface ChatStore {
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  updateMessage: (id: string, newMessage: string) => void;
  forwardMessage: (id: string) => void;

  editingMessage: EditingMessage | null;
  setEditingMessage: (msg: EditingMessage | null) => void;
  clearEditingMessage: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),

  updateMessage: (id, newMessage) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, message: newMessage } : msg
      ),
    })),

  // Duplikasi pesan OPD → jadi pesan baru milik Admin
  forwardMessage: (id) =>
    set((state) => {
      const target = state.messages.find((msg) => msg.id === id);
      if (!target) return state;

      const now = new Date();
      const time = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const forwardedMsg: ChatMessage = {
        id: `fwd-${Date.now()}`,
        message: target.message,
        time,
        isSender: true,
        isOPD: false,
      };

      return { messages: [...state.messages, forwardedMsg] };
    }),

  editingMessage: null,
  setEditingMessage: (msg) => set({ editingMessage: msg }),
  clearEditingMessage: () => set({ editingMessage: null }),
}));