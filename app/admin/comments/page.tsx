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
import { DateRange } from "@/components/DateRangePicker";

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
  const [selectedRange, setSelectedRange] = useState('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ from: null, to: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<SocialInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openCreateTicketModal, openDeleteModal } = InteractionStore();

  // const itemsPerPage = 5;
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerPage = window.matchMedia('(min-width: 1536px)').matches ? 8 : 5;
      
      // Hanya update jika nilainya benar-benar berbeda untuk menghindari render loop
      if (newItemsPerPage !== itemsPerPage) {
        setItemsPerPage(newItemsPerPage);
        
        // OPTIONAL: Reset ke halaman 1 jika terjadi perubahan ukuran layar
        // agar tidak membingungkan user
        setCurrentPage(1); 
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerPage]); // Masukkan itemsPerPage ke dependency agar re-run dengan benar

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

  // const paginatedUsers = useMemo(() => {
  //   const startIndex = (currentPage - 1) * itemsPerPage;
  //   const endIndex = startIndex + itemsPerPage;

  //   return filteredUsers.slice(startIndex, endIndex);
  // }, [filteredUsers, currentPage, itemsPerPage]);

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Handle time range change — receives both the value and optional date range
  const handleTimeRangeChange = (value: string, dateRange?: DateRange) => {
    setSelectedRange(value);
    if (value === 'custom' && dateRange) {
      setCustomDateRange(dateRange);
      // TODO: use customDateRange.from & customDateRange.to to filter your data
    } else {
      setCustomDateRange({ from: null, to: null });
    }
    setCurrentPage(1);
  };

  const columns: ColumnDefinition[] = [
    {
      header: "Time",
      key: "capturedAt",
      className: "text-center",
      cell: (value: any) => 
        // formatTime(value),
        <div className="font-medium w-[140px]">{formatTime(value)}</div>,
    },
    { 
      header: "Username", 
      key: "username",
      className: "text-center",
      cell: (value: any) => 
        // formatTime(value),
        <div className="font-medium w-[120px]">{value}</div>,
    },
    { 
      header: "Message Content", 
      key: "content",
      className: "text-center",
      cell: (value: any) => 
        // formatTime(value),
        <div className="text-left font-medium w-[340px] line-clamp-2 break-words whitespace-normal">{value}</div>,
    },
    {
      header: "Destination Account",
      key: "channel",
      className: "text-center",
      cell: (value: any) => value?.accountHandle ?? value?.platform ?? "-",
    },
    {
      header: "Permalink",
      key: "permalink",
      className: "text-center",
      cell: (value: any) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs 2xl:text-sm">
            View Post
          </a>
        ) : (
          <span className="text-gray-400 text-xs 2xl:text-sm">-</span>
        ),
    },
    {
      header: "Actions",
      key: "id",
      className: "text-center",
      cell: (_value: any, row: any) => (
        <div className="flex justify-center gap-2">
          {!row.isTicketCreated && (
            <button 
              onClick={() => openCreateTicketModal(row, activeTab as "comments" | "mentions")}
              className="p-0.5 text-[#1D2F58] hover:text-blue-500 hover:bg-slate-200 rounded-sm transition-colors duration-300 cursor-pointer"
            >
              <Plus size={16} />
            </button>
          )}
          <button 
            onClick={() => openDeleteModal(row, activeTab as "comments" | "mentions")}
            className="p-0.5 text-[#1D2F58] hover:text-red-500 hover:bg-slate-200 rounded-sm transition-colors duration-300 cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 py-2 w-[1000px] 2xl:w-[1300px]">
      <div className="mb-8 py-1">
        <h1 className="text-3xl 2xl:text-4xl font-bold text-[#041942]">Sosial Interactions</h1>
        <p className="text-gray-500 text-sm 2xl:text-base ">Manage comments from social media here</p>
      </div>

      {/* Interaction Tabs dan Time Range */}
      <div className="flex justify-between items-center mb-8">
        <InteractionTabs
          tabs={[{ id: 'comments', label: 'Comments' }, { id: 'mentions', label: 'Mentions' }]}
          activeTab={activeTab}
          onChange={(id) => {
            setActiveTab(id);
            setCurrentPage(1);
          }}
        />
        <TimeRange
          options={timeOptions}
          value={selectedRange}
          onChange={handleTimeRangeChange}
        />
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-t-lg border border-gray-100 shadow-sm min-h-[550px] flex flex-col">
        <div className="p-6 pb-0">
          <h2 className="text-2xl 2xl:text-3xl font-bold text-[#041942] mb-6 capitalize tracking-tight">
            {activeTab} List
          </h2>

          <div className="grow">
            {isLoading ? (
              <div className="py-10 text-center text-gray-400 text-sm 2xl:text-base">Loading…</div>
            ) : error ? (
              <div className="py-10 text-center text-red-500 text-sm 2xl:text-base">{error}</div>
            ) : (
              <TableTemplate columns={columns} data={currentData} />
            )}
            <CreateDeleteModals />
          </div>
        </div>

        {/* Pagination */}
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
