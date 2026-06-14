"use client";

import { useEffect, useMemo, useState } from "react";
import SearchField from "./SearchField";
import Image from "next/image";
import { InteractionTabs } from "./InteractionTabs";
import { TimeRange } from "./TimeRange";
import { ChatItem } from "./ChatItem";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useInboxStore, type InboxConversation } from "@/store/useInboxStore";


function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function platformOf(c: InboxConversation): "whatsapp" | "instagram" {
  return c.channel.platform === "WHATSAPP" ? "whatsapp" : "instagram";
}

const ListChat = ({ role }: { role: "ADMIN" | "OPD" }) => {
  const pathname = usePathname();
  const {
    conversations,
    isLoadingList,
    listError,
    filters,
    setFilters,
    fetchConversations,
    subscribeRealtime,
  } = useInboxStore();

  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchConversations();
    const unsub = subscribeRealtime(role);
    return () => unsub();
  }, [fetchConversations, subscribeRealtime, role]);

  const inboxTabs = useMemo(
    () => [
      { id: "all", label: "All Chat" },
      { id: "unread", label: "Unread" },
      {
        id: "whatsapp",
        label: "WhatsApp",
        icon: <Image src="/images/whatsapp-icon.png" width={16} height={16} alt="wa" />,
      },
      {
        id: "instagram",
        label: "Instagram",
        icon: <Image src="/images/instagram-icon.png" width={16} height={16} alt="ig" />,
      },
    ],
    []
  );

  // Updated paths to match new route structure (without /dashboard/)
  const basePath = role === "ADMIN" ? "/admin/chat" : "/opd/inbox";

  return (
    <aside className="w-full border-r flex flex-col h-full z-10">
      <div className="px-2 py-1 space-y-4 border-b">
        <h2 className="text-2xl 2xl:text-3xl font-bold text-[#041942]">All Inbox</h2>

        <div className="relative">
          <SearchField
            placeholder="Search message..."
            value={filters.search}
            onChange={(v: string) => setFilters({ search: v })}
            className="w-full"
          />
        </div>

        <div>
          <InteractionTabs
            tabs={inboxTabs}
            activeTab={filters.platform}
            onChange={(id) =>
              setFilters({ platform: id as typeof filters.platform })
            }
          />
        </div>

        <div className="flex gap-2">
          <TimeRange
            options={[
              { label: "Newest", value: "newest" },
              { label: "Oldest", value: "oldest" },
            ]}
            value={filters.sort}
            onChange={(v: string) => setFilters({ sort: v as typeof filters.sort })}
            prefixLabel="Sort by :"
          />
          {/* <TimeRange
            prefixLabel="Status :"
            options={[
              { label: "All Status", value: "all" },
              { label: "To Do", value: "to_do" },
              { label: "In Progress", value: "in_progress" },
              { label: "Done", value: "done" },
            ]}
            value={filterStatus}
            onChange={(v: string) => setFilterStatus(v)}
          /> */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoadingList && conversations.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : listError ? (
          <div className="p-10 text-center text-red-500 text-sm">{listError}</div>
        ) : conversations.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No messages found.</div>
        ) : (
          conversations.map((c) => {
            const platform = platformOf(c);
            const href = `${basePath}/${c.id}`;

              return (
              <Link href={href} key={c.id}>
                <ChatItem
                  name={c.citizen.name}
                  avatarUrl={c.citizen.profilePicUrl}
                  message={
                    c.lastMessage?.content
                      ? c.lastMessage.content
                      : c.lastMessage?.hasAttachment
                      ? "[Image]"
                      : "(no message)"
                  }
                  time={timeAgo(c.lastMessage?.at ?? c.lastMessageAt)}
                  ticketCount={c.ticketCount}
                  platform={platform}
                  flagColor="text-green-500"
                  isActive={pathname === href}
                  unreadCount={c.unreadCount}
                />
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ListChat;
