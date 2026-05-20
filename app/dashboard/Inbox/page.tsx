"use client";

import { useState } from "react";
import Image from "next/image";
import { ChatItem } from "@/components/ChatItem";
import { TimeRange } from "@/components/TimeRange";
import { InteractionTabs } from "@/components/InteractionTabs";
import ChatDetailView from "@/components/ChatDetailView";
import SearchField from "@/components/SearchField";

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  const inboxTabs = [
    { id: "all", label: "All Chat" },
    { id: "unread", label: "Unread" },
    { 
      id: "whatsapp", 
      label: "WhatsApp", 
      icon: <Image src="/images/whatsapp-icon.png" width={16} height={16} alt="wa" /> 
    },
    { 
      id: "instagram", 
      label: "Instagram", 
      icon: <Image src="/images/instagram-icon.png" width={16} height={16} alt="ig" /> 
    },
  ];

  const chatData = [
    { 
      id: "1", name: "Bagus", message: "Lorem ipsum dolor sit amet consectetur.", time: "12m ago",
      status: "Done", statusColor: "bg-green-100 text-green-700",
      category: "Question", categoryColor: "bg-orange-100 text-orange-700",
      department: "Dinas Sosial", platform: "whatsapp" as const, flagColor: "text-green-500", unread: false 
    },
    { 
      id: "2", name: "Sarah Blake", message: "Mohon tindak lanjut terkait jalan rusak.", time: "45m ago",
      status: "In Progress", statusColor: "bg-blue-100 text-blue-700",
      category: "Complaint", categoryColor: "bg-pink-100 text-pink-700",
      department: "Dinas Perhubungan", platform: "whatsapp" as const, flagColor: "text-green-500", unread: true 
    },
    { 
      id: "3", name: "Felix Cooper", message: "Bagaimana cara membuat kartu identitas?", time: "2h ago",
      status: "To Do", statusColor: "bg-red-100 text-red-700",
      category: "Complaint", categoryColor: "bg-pink-100 text-pink-700",
      department: "Dinas Lingkungan Hidup", platform: "instagram" as const, flagColor: "text-orange-500", unread: false 
    },
  ];

  const filteredChats = chatData.filter((chat) => {
    if (activeTab === "unread") return chat.unread;
    if (activeTab === "whatsapp") return chat.platform === "whatsapp";
    if (activeTab === "instagram") return chat.platform === "instagram";
    return true;
  });

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* List Chat */}
      <div className="w-[390px] border-r flex flex-col h-full bg-white z-10">
        <div className="p-4 space-y-4 border-b">
          <h2 className="text-2xl font-bold text-slate-900">All Inbox</h2>
          
          <div className="relative">
            <SearchField 
              placeholder="Search message..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full" 
            />
          </div>

          <div className="overflow-x-auto">
            <InteractionTabs 
              tabs={inboxTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="flex gap-2">
            <TimeRange 
              options={[{label: "Newest", value: "newest"}, {label: "Oldest", value: "oldest"}]}
              value={sort}
              onChange={setSort}
              prefixLabel="Sort by :"
            />
            <TimeRange 
              prefixLabel="Status :"
              options={[
                { label: "All Status", value: "all" },             
                { label: "To Do", value: "to_do" },
                { label: "In Progress", value: "in_progress" },
                { label: "Done", value: "done" },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              variant="default" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div key={chat.id} onClick={() => setSelectedChat(chat)}>
                <ChatItem
                  {...chat}
                  ticketCount={0}
                  isActive={selectedChat?.id === chat.id}
                />
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-400 text-sm">
              No messages found.
            </div>
          )}
        </div>
      </div>

      {/* Kondisional antara Empty State atau ChatDetail */}
      <div className="flex-1 h-full">
        {selectedChat ? (
          <ChatDetailView activeChat={selectedChat} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-10">
            <div className="relative w-80 h-48 bg-slate-900 rounded-2xl mb-12 shadow-2xl flex items-center justify-center">
                <div className="w-16 h-4 bg-slate-700 rounded-full animate-pulse mr-20"></div>
                <div className="w-24 h-4 bg-slate-800 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-72 h-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-3">
                    <div className="h-4 w-32 bg-gray-100 rounded-full"></div>
                    <div className="h-4 w-52 bg-gray-50 rounded-full"></div>
                    <div className="h-4 w-44 bg-gray-50 rounded-full"></div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-800">Every message deserves a response</h3>
            <p className="text-gray-400 mt-2 text-center max-w-sm">
              Choose a message from the left menu and start the conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}