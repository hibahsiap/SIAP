"use client";

import { useEffect, useMemo } from "react";
import SearchField from "./SearchField";
import Image from "next/image";
import { InteractionTabs } from "./InteractionTabs";
import { TimeRange } from "./TimeRange";
import { ChatItem } from "./ChatItem";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useInboxStore, type InboxConversation } from "@/store/useInboxStore";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  TO_DO: { label: "To Do", color: "bg-red-100 text-red-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  ON_HOLD: { label: "On Hold", color: "bg-orange-100 text-orange-700" },
  DONE: { label: "Done", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-200 text-gray-700" },
};

const TYPE_LABEL: Record<string, { label: string; color: string }> = {
  COMPLAINT: { label: "Complaint", color: "bg-pink-100 text-pink-700" },
  QUESTION: { label: "Question", color: "bg-orange-100 text-orange-700" },
  FEEDBACK: { label: "Feedback", color: "bg-purple-100 text-purple-700" },
};

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

  useEffect(() => {
    fetchConversations();
    const unsub = subscribeRealtime();
    return () => unsub();
  }, [fetchConversations, subscribeRealtime]);

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

  const basePath = role === "ADMIN" ? "/admin/dashboard/chat" : "/opd/dashboard/inbox";

  return (
    <aside className="w-97.5 border-r flex flex-col h-full z-10">
      <div className="p-4 space-y-4 border-b">
        <h2 className="text-2xl font-bold text-slate-900">All Inbox</h2>

        <div className="relative">
          <SearchField
            placeholder="Search message..."
            value={filters.search}
            onChange={(v: string) => setFilters({ search: v })}
            className="w-full"
          />
        </div>

        <div className="overflow-x-auto">
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
            const status = c.ticket
              ? STATUS_LABEL[c.ticket.status] ?? { label: c.ticket.status, color: "bg-gray-100 text-gray-700" }
              : { label: "No Ticket", color: "bg-gray-100 text-gray-600" };
            const type = c.ticket?.type
              ? TYPE_LABEL[c.ticket.type] ?? { label: c.ticket.type, color: "bg-gray-100 text-gray-700" }
              : { label: c.ticket?.category?.name ?? "Uncategorized", color: "bg-gray-100 text-gray-700" };
            const flagColor =
              c.ticket?.urgency === "HIGH" || c.ticket?.urgency === "CRITICAL"
                ? "text-red-500"
                : c.ticket?.urgency === "MEDIUM"
                ? "text-orange-500"
                : "text-green-500";
            const href = `${basePath}/${c.id}`;

            return (
              <Link href={href} key={c.id}>
                <ChatItem
                  name={c.citizen.name}
                  avatarUrl={c.citizen.profilePicUrl}
                  message={c.lastMessage?.content ?? "(no message)"}
                  time={timeAgo(c.lastMessage?.at ?? c.lastMessageAt)}
                  status={status.label}
                  statusColor={status.color}
                  category={type.label}
                  categoryColor={type.color}
                  department={c.ticket?.assignedOpd?.name ?? "Unassigned"}
                  platform={platform}
                  flagColor={flagColor}
                  isActive={pathname === href}
                  unread={c.unread}
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
