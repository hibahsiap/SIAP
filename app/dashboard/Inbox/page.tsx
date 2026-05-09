// app/inbox/page.tsx
"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { ChatItem } from "@/components/ChatItem";
import { TimeRange } from "@/components/TimeRange";
import Image from "next/image";

export default function InboxPage() {
  const [sort, setSort] = useState("newest");

  return (
    <div className="flex h-screen bg-white">
      {/* Kolon Kiri: List Chat */}
      <div className="w-[400px] border-r flex flex-col h-full">
        {/* Title */}
        <div className="p-4 space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">All Inbox</h2>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search message..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm focus:ring-1 focus:ring-slate-400 outline-none"
            />
          </div>

          {/* Platform Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button className="px-3 py-1 bg-slate-800 text-white rounded-full text-xs">All Chat</button>
            <button className="px-3 py-1 border rounded-full text-xs hover:bg-gray-100">Unread</button>
            <button className="px-3 py-1 border rounded-full text-xs flex items-center gap-1">
              <span className="text-green-500"><Image src="/images/whatsapp-icon.png" width={18} height={18} alt="WA" /></span> WhatsApp
            </button>
            <button className="px-3 py-1 border rounded-full text-xs flex items-center gap-1">
              <span className="text-pink-500"><Image src="/images/instagram-icon.png" width={15} height={15} alt="IG" /></span> Instagram
            </button>
          </div>

          {/* Filter Time and Status */}
          <div className="flex gap-2">
            <TimeRange 
              options={[{label: "Newest", value: "newest"}, {label: "Oldest", value: "oldest"}]}
              value={sort}
              onChange={setSort}
              prefixLabel="Sort by :"
            />
            <TimeRange 
              options={[{label: "All Status", value: "all"}]}
              value="all"
              onChange={() => {}}
              prefixLabel="Status :"
            />
          </div>
        </div>

        {/* Scrollable Chat List */}
        <div className="flex-1 overflow-y-auto">
          <ChatItem 
            name="Bagus Anugrah" message="Lorem ipsum dolor sit amet consectetur." time="12m ago"
            status="Done" statusColor="bg-green-100 text-green-700"
            category="Question" categoryColor="bg-orange-100 text-orange-700"
            department="Dinas Sosial" platform="whatsapp" flagColor="text-green-500" isActive
          />
          <ChatItem 
            name="Sarah Blake" message="Lorem ipsum dolor sit amet consectetur." time="12m ago"
            status="In Progress" statusColor="bg-blue-100 text-blue-700"
            category="Complaint" categoryColor="bg-pink-100 text-pink-700"
            department="Dinas Perhubungan" platform="whatsapp" flagColor="text-green-500"
          />
          <ChatItem 
            name="Felix Cooper" message="Lorem ipsum dolor sit amet consectetur." time="12m ago"
            status="To Do" statusColor="bg-red-100 text-red-700"
            category="Complaint" categoryColor="bg-pink-100 text-pink-700"
            department="Dinas Lingkungan Hidup" platform="instagram" flagColor="text-orange-500"
          />
        </div>
      </div>

      {/* Kolon Kanan: Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-10">
        <div className="relative w-80 h-48 bg-slate-900 rounded-2xl mb-12 shadow-2xl">
          <div className="absolute -bottom-8 -left-8 w-72 h-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
            <div className="h-4 w-32 bg-gray-200 rounded-full mb-3"></div>
            <div className="h-4 w-48 bg-gray-100 rounded-full mb-2"></div>
            <div className="h-4 w-40 bg-gray-100 rounded-full"></div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Every message deserves a response</h3>
        <p className="text-gray-400 mt-2 text-center max-w-sm">
          Choose a message from the left menu and start the conversation
        </p>
      </div>
    </div>
  );
}