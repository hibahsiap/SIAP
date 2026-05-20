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

  editingMessage: null,
  setEditingMessage: (msg) => set({ editingMessage: msg }),
  clearEditingMessage: () => set({ editingMessage: null }),
}));