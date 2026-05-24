"use client";

import { useState, useEffect, useCallback } from "react";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { InteractionTabs } from "@/components/InteractionTabs";
import { TimeRange } from "@/components/TimeRange";
import { Pagination } from "@/components/Paginations";
import { Plus, Trash2 } from "lucide-react";
import { InteractionStore } from "@/components/InteractionStore";
import CreateDeleteModals from "@/components/SocialModal";
import { formatDateTime as formatTime } from "@/lib/formatdate";

type SocialInteraction = {
  id: string;
  interactionType: "COMMENT" | "MENTION";
  username: string;
  content: string;
  capturedAt: string;
  isTicketCreated: boolean;
  channel: { id: string; platform: string; accountHandle: string | null };
  convertedTicketId: string | null;
};

export default function SocialInteractionsPage() {
  const [activeTab, setActiveTab] = useState("comments");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<SocialInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openCreateTicketModal, openDeleteModal } = InteractionStore();

  const itemsPerPage = 5;

  const fetchData = useCallback(async (tab: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const type = tab === "comments" ? "COMMENT" : "MENTION";
      const res = await fetch(`/api/social-interactions?type=${type}`);
      if (!res.ok) throw new Error("Gagal memuat data");
      const json: SocialInteraction[] = await res.json();
      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
    setCurrentPage(1);
  }, [activeTab, fetchData]);

  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: ColumnDefinition[] = [
    {
      header: "Time",
      key: "capturedAt",
      cell: (value: any) => formatTime(value),
    },
    { header: "Username", key: "username" },
    { header: "Message Content", key: "content" },
    {
      header: "Destination Account",
      key: "channel",
      cell: (value: any) => value?.accountHandle ?? value?.platform ?? "-",
    },
    {
      header: "Permalink",
      key: "permalink",
      cell: (value: any) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
            View Post
          </a>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        ),
    },
    {
      header: "Actions",
      key: "id",
      cell: (_value: any, row: any) => (
        <div className="flex gap-2">
          {!row.isTicketCreated && (
            <button onClick={() => openCreateTicketModal(row, activeTab as "comments" | "mentions")}>
              <Plus size={16} />
            </button>
          )}
          <button onClick={() => openDeleteModal(row, activeTab as "comments" | "mentions")}>
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#041942]">Sosial Interactions</h1>
        <p className="text-gray-500 text-sm">Manage comments from social media here</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <InteractionTabs
          tabs={[
            { id: "comments", label: "Comments" },
            { id: "mentions", label: "Mentions" },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
        <TimeRange
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
          ]}
          value="newest"
          onChange={() => {}}
          prefixLabel="Sort by :"
        />
      </div>

      <div className="bg-white rounded-t-lg border border-gray-100 shadow-sm min-h-[550px] flex flex-col">
        <div className="p-6 pb-0">
          <h2 className="text-2xl font-bold text-[#041942] mb-6 capitalize tracking-tight">
            {activeTab} List
          </h2>

          <div className="flex-grow">
            {isLoading ? (
              <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
            ) : error ? (
              <div className="py-10 text-center text-red-500 text-sm">{error}</div>
            ) : (
              <TableTemplate columns={columns} data={currentData} />
            )}
            <CreateDeleteModals />
          </div>
        </div>

        <div className="mt-auto">
          <Pagination
            totalItems={data.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
