"use client";

import { useEffect } from "react";
import { useChatStore, ChatMessage } from "@/constants/chatStore";
import { ChatBubble } from "./ChatBubble";

export const ChatMessageList = ({ initialMessages }: { initialMessages: ChatMessage[] }) => {
  const { messages, setMessages } = useChatStore();

  // Inisialisasi sekali saat mount
  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  return (
    <>
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg.message}
          time={msg.time}
          isSender={msg.isSender}
          isOPD={msg.isOPD}
          senderName={msg.senderName}
        />
      ))}
    </>
  );
};