import { ChatBubble } from "@/components/ChatBubble";
import { ChatHeader, ForwardControl } from "@/components/ChatHeader";
import { chatData } from "@/constants/chatData";
import { Plus, SendHorizontal } from "lucide-react";

export default async function ChatDetailPage({ params }: { params: Promise<{ chatId: string }>}) {

    const resolvedParams = await params;
    const chatId = resolvedParams.chatId;

    console.log("Tipe chatData:", typeof chatData, Array.isArray(chatData));
    console.log("Isi chatData:", chatData);
    const chatInfo = chatData.find((c) => c.id === chatId);

    if (!chatInfo) return (
        <div className="flex-1 flex items-center justify-center text-gray-400">
            Pilih pesan untuk memulai percakapan
        </div>
    );

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <ChatHeader chatId={chatId} name={chatInfo.name} phone="085123456789" role="ADMIN" />
      
      <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">

        <ForwardControl />
        
        {/* Dummy Chat History */}
        <ChatBubble 
            message="Lorem ipsum dolor sit amet consectetur. Est urna quam ornare egestas." 
            time="10:45 AM" 
        />
        <ChatBubble 
            message="Lorem ipsum dolor sit amet consectetur. Non morbi ultrices tempor fames." 
            time="11:05 AM" 
            isSender 
        />
        <ChatBubble 
            message="Ut sociis egestas a amet. Sed porttitor blandit ullamcorper tempor eu pretium dui nibh." 
            time="10:48 AM" 
            isOPD 
            senderName="OPD (Sekretariat Daerah)"
        />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-[#F9F9F9]">
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
          <button className="text-gray-400 hover:text-slate-600">
            <Plus size={20} />
          </button>
          <input 
            type="text" 
            placeholder="Type a response..." 
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button className="bg-[#1e293b] p-2 rounded-full text-white">
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}