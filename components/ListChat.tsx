"use client";

import { useState } from "react";
import SearchField from "./SearchField";
import Image from "next/image";
import { InteractionTabs } from "./InteractionTabs";
import { TimeRange } from "./TimeRange";
import { ChatItem } from "./ChatItem";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { chatData } from "@/constants/chatData";


const ListChat = ({role} : {role: 'ADMIN' | 'OPD'}) => {

    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState("all");
    const [sort, setSort] = useState("newest");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredChats = chatData.filter((chat) => {
        if (activeTab === "unread") return chat.unread;
        if (activeTab === "whatsapp") return chat.platform === "whatsapp";
        if (activeTab === "instagram") return chat.platform === "instagram";
        return true;
    });

    return (
        <aside className="w-97.5 border-r flex flex-col h-full z-10">
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

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredChats.length > 0 ? (
                    role === "ADMIN" ? (
                        filteredChats.map((chat) => (
                            <Link href={`/admin/chat/${chat.id}`} key={chat.id}>
                                <ChatItem 
                                    {...chat}
                                    isActive={pathname === `/chat/${chat.id}`} 
                                />
                            </Link>
                        ))
                    ) : (
                        filteredChats.map((chat) => (
                            <Link href={`/opd/inbox/${chat.id}`} key={chat.id}>
                                <ChatItem 
                                    {...chat}
                                    isActive={pathname === `/inbox/${chat.id}`} 
                                />
                            </Link>
                        ))
                    )
                ) : (
                    <div className="p-10 text-center text-gray-400 text-sm">
                    No messages found.
                    </div>
                )}
            </div>
        </aside>
    )
}

export default ListChat;