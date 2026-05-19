"use client";

import { useMemo, useState } from "react";
import SearchField from "./SearchField";
import Image from "next/image";
import { InteractionTabs } from "./InteractionTabs";
import { TimeRange } from "./TimeRange";
import { ChatItem } from "./ChatItem";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { chatData } from "@/constants/chatData";
import { Search } from "@boxicons/react/index";
import { Input } from "./ui/input";
import { useUserStore } from "@/store/useUserStore";
import SearchEmptyState from "./SearchEmpty";
import EmptyState from "./EmptyState";
import { SearchX, UserX } from "lucide-react";


const ListChat = ({role} : {role: 'ADMIN' | 'OPD'}) => {

    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState("all");
    const [sort, setSort] = useState("newest");
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const { isLoading } = useUserStore()

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

    const finalFilteredChats = useMemo(() => {
        return chatData.filter((chat) => {
            // 1. Filter berdasarkan Kategori Tab Interaksi
            const matchesTab = 
                activeTab === "all" ||
                (activeTab === "unread" && chat.unread) ||
                (activeTab === "whatsapp" && chat.platform === "whatsapp") ||
                (activeTab === "instagram" && chat.platform === "instagram");

            // 2. Filter berdasarkan Kolom Pencarian Nama
            const matchesSearch = (chat.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            // 3. Filter berdasarkan Status (Jika data dummy kamu memiliki properti status)
            // const matchesStatus = filterStatus === "all" || chat.status === filterStatus;

            return matchesTab && matchesSearch;
        });
    }, [activeTab, searchQuery]);

    return (
        <aside className="w-97.5 border-r flex flex-col h-full z-10">
            <div className="p-4 space-y-4 border-b">
                <h2 className="text-2xl font-bold text-slate-900">All Inbox</h2>
                
                <div className="relative">
                    <SearchField 
                        placeholder="Search users..."
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

            {/* DAFTAR CHAT HASIL FILTERING */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-10 text-center text-gray-400 text-sm">Loading chats...</div>
                ) : finalFilteredChats.length > 0 ? (
                    role === "ADMIN" ? (
                        finalFilteredChats.map((chat) => (
                            <Link href={`/admin/chat/${chat.id}`} key={chat.id}>
                                <ChatItem 
                                    {...chat}
                                    isActive={pathname === `/admin/chat/${chat.id}`} 
                                />
                            </Link>
                        ))
                    ) : (
                        finalFilteredChats.map((chat) => (
                            <Link href={`/opd/inbox/${chat.id}`} key={chat.id}>
                                <ChatItem 
                                    {...chat}
                                    isActive={pathname === `/opd/inbox/${chat.id}`} 
                                />
                            </Link>
                        ))
                    )
                ) : (
                    <div className="p-10 text-center text-gray-400 text-sm">
                        {searchQuery !== "" ? 
                            <div className="flex flex-col items-center justify-center gap-8">
                                <UserX size={96} strokeWidth={1}/>
                                <p className="text-base"> No results found for "<b>{searchQuery}</b>" </p>
                            </div>
                        : "No messages found."}
                    </div>
                )}
            </div>

        </aside>
    )
}

export default ListChat;