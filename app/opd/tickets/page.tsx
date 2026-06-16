"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import TableTemplate2, { ColumnDefinition } from '@/components/TableTemplate2';
import EmptyState from '@/components/EmptyState';
import SearchEmptyState from '@/components/SearchEmpty';
import DeleteAlertModal from '@/components/DeleteModal';
import { Trash2, Loader2 } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import FilterSidebar, { FilterState } from '@/components/Filter';
import KanbanBoard from '@/components/spectrumui/kanbanboard';
import Link from 'next/link';
import { toast } from 'sonner';
import { isWithinRange } from '@/utils/dateFilter';
import { toStatusEnum, toPriorityEnum } from '@/utils/ticketFilters';

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    "To Do": "bg-[#F7D9D5] text-[#6D3531]",
    "In Progress": "bg-[#C1DEF5] text-[#264A72]",
    "Done": "bg-[#D7E6DD] text-[#2A533C]",
    "On Hold": "bg-[#E7D9CF] text-[#584437]",
    "Cancelled": "bg-[#E1DFDC] text-[#494846]",
  };
  const dotColors: Record<string, string> = {
    "To Do": "bg-[#E56458]",
    "In Progress": "bg-[#2783DE]",
    "Done": "bg-[#46A171]",
    "On Hold": "bg-[#B68965]",
    "Cancelled": "bg-[#8E8B86]",
  };
  const style = styles[status] ?? "bg-gray-100 text-gray-600";
  const dot = dotColors[status] ?? "bg-gray-500";
  return (
    <div className={`mx-auto inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-[11px] 2xl:text-[13px] font-bold tracking-wide ${style} w-30`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`}></span>
      {status}
    </div>
  );
};

const formatDate = (val: string | null) => {
  if (!val) return "-";
  return new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const typeLabel: Record<string, string> = {
  COMPLAINT: "Pengaduan",
  QUESTION: "Pertanyaan",
  FEEDBACK: "Saran",
};

const getTypeBadge = (type: string | null) => {
  if (!type) return <span className="text-gray-400">-</span>;
  const display = typeLabel[type] ?? type;
  const styles: Record<string, string> = {
    Pengaduan: "bg-red-100/80 text-red-700",
    Pertanyaan: "bg-blue-100/80 text-blue-700",
    Saran: "bg-green-100/80 text-green-700",
  };
  return <span className={`px-3 py-1.5 rounded-md text-[11px] 2xl:text-[13px] font-bold tracking-wide ${styles[display] ?? "bg-gray-100 text-gray-600"}`}>{display}</span>;
};

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    "Low": "bg-[#E3F2E7] text-[#4C9A61]",
    "Medium": "bg-yellow-100/80 text-yellow-700",
    "High": "bg-red-100/80 text-red-700",
  };
  return <div className={`px-3 py-1.5 rounded-md text-[11px] 2xl:text-[13px] font-bold tracking-wide ${styles[priority] ?? "bg-gray-100 text-gray-600"}`}>{priority}</div>;
};

type TabCategory = 'kanban' | 'all' | 'aspirations';

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('kanban');
  const [searchQuery, setSearchQuery] = useState("");
  const { openEditModal, openDeleteModal, isDeleteModalOpen, closeDeleteModal } = useTaskStore();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [allTicketsData, setAllTicketsData] = useState<any[]>([]);
  const [aspirationsData, setAspirationsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    opds: [],
    statuses: [],
    types: [],
    priorities: [],
    categories: [],
    rangeTime: "",
  });

  useEffect(() => {
    if (activeTab === 'kanban') return;

    const tab = activeTab === 'aspirations' ? 'aspirations' : 'all';
    setIsLoading(true);

    fetch(`/api/opd/tickets?tab=${tab}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (tab === 'all') setAllTicketsData(data);
        else setAspirationsData(data);
      })
      .catch((err) => {
        console.error("[OPD Tickets] failed to load", err);
        toast.error("Gagal memuat data tiket");
      })
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  const currentData = useMemo(() => {
    if (activeTab === 'all') return allTicketsData;
    return aspirationsData;
  }, [activeTab, allTicketsData, aspirationsData]);

  const filteredData = useMemo(() => {
    const filtered = currentData.filter((item: any) => {
      const searchStr = searchQuery.toLowerCase();
      const searchField = item.taskName || item.pengirim || "";
      if (!searchField.toLowerCase().includes(searchStr)) return false;

      if (appliedFilters.statuses.length > 0) {
        if (!appliedFilters.statuses.includes(toStatusEnum(item.status))) return false;
      }

      if (appliedFilters.types.length > 0) {
        if (!item.type || !appliedFilters.types.includes(item.type)) return false;
      }

      if (appliedFilters.priorities.length > 0) {
        if (!appliedFilters.priorities.includes(toPriorityEnum(item.priority))) return false;
      }

      if (appliedFilters.categories.length > 0) {
        if (!item.categoryName || !appliedFilters.categories.includes(item.categoryName)) return false;
      }

      if (appliedFilters.rangeTime) {
        if (!isWithinRange(item.startDate ?? item.createdAt, appliedFilters.rangeTime)) return false;
      }

      return true;
    });

    return [...filtered].sort((a: any, b: any) => {
      const getTime = (item: any) => {
        const ref = item.startDate ?? item.createdAt;
        if (ref) {
          const d = new Date(ref);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        }
        return 0;
      };
      return sortOrder === 'newest'
        ? getTime(b) - getTime(a)
        : getTime(a) - getTime(b);
    });
  }, [currentData, searchQuery, appliedFilters, sortOrder]);

  const columns = useMemo<ColumnDefinition[]>(() => {
    const messageColumn = {
      header: "Pesan Aspirasi",
      key: "message",
      cell: (val: string) => (
        <span className="block w-full min-w-[250px] 2xl:min-w-[300px] whitespace-normal break-words text-[12px] 2xl:text-[14px] font-normal leading-relaxed text-justify text-[#1D2F58]">
          {val}
        </span>
      )
    };

    if (activeTab === 'kanban') return [];

    if (activeTab === 'all') {
      return [
        {
          header: "Title",
          key: "taskName",
          cell: (val: string, row: any) => (
            <Link href={`/opd/tickets/${row.id}`} className="whitespace-normal w-[180px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val}
            </Link>
          )
        },
        { header: "OPD", key: "opd", className: "text-center", cell: (val: string) => <div className="w-[180px] whitespace-normal break-words">{val}</div> },
        { header: "Status", key: "status", className: "text-center", cell: (val: string) => getStatusBadge(val) },
        { header: "Type", key: "type", className: "text-center", cell: (val: string) => getTypeBadge(val) },
        { header: "Category", key: "categoryName", className: "text-center", cell: (val: string) => val ?? "-" },
        { header: "Priority", key: "priority", className: "text-center", cell: (val: string) => getPriorityBadge(val) },
        { header: "Start Date", key: "startDate", className: "text-center", cell: (val: string) => formatDate(val) },
        { header: "Finish Date", key: "finishDate", className: "text-center", cell: (val: string) => formatDate(val) },
        messageColumn,
      ];
    }

    return [
      {
        header: "Pengirim",
        key: "pengirim",
        className: "text-center",
        cell: (val: string, row: any) => (
          <Link href={`/opd/tickets/${row.id}`} className="whitespace-normal w-[140px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
            {val}
          </Link>
        )
      },
      { header: "Status", key: "status", className: "text-center", cell: (val: string) => getStatusBadge(val) },
      { header: "Priority", key: "priority", className: "text-center", cell: (val: string) => getPriorityBadge(val) },
      messageColumn,
      {
        header: "Action",
        key: "action",
        cell: (_: any, row: any) => (
          <button onClick={() => openDeleteModal(row)} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )
      },
    ];
  }, [activeTab, openDeleteModal]);

  return (
    <div className="flex flex-col min-w-0 w-full h-screen px-4 py-2">

      <div className="shrink-0 flex flex-col gap-4 py-4 mb-4 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex flex-wrap gap-2">
          {[{ id: 'kanban', label: 'Kanban' },
          { id: 'all', label: 'All Tickets' },
          { id: 'aspirations', label: 'Aspirations' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as TabCategory); setSearchQuery(""); }}
              className={`px-5 h-10 rounded-[12px] text-sm 2xl:text-base 2xl:h-12 font-semibold transition-all duration-200 ${activeTab === tab.id ? "bg-[#041942] text-white shadow-md border-[#041942]" : "bg-white text-[#1B1B1B] hover:bg-gray-100 border border-[#D2D2D2]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-auto">
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onFilterClick={() => setIsFilterOpen(true)}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto scrollbar-thick pt-1 pb-1">
        {activeTab === 'kanban' ? (
          <KanbanBoard searchQuery={searchQuery} filters={appliedFilters} sortOrder={sortOrder} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1D2F58]" />
          </div>
        ) : filteredData.length > 0 ? (
          <div className="w-full">
            <TableTemplate2 columns={columns} data={filteredData as any} />
          </div>
        ) : searchQuery !== "" ? (
          <SearchEmptyState type={activeTab} />
        ) : (
          <EmptyState
            title="There is currently no data available"
            description="Please add new data to see it displayed here."
          />
        )}
      </div>

      <DeleteAlertModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          toast.success("Ticket deleted successfully");
          closeDeleteModal();
        }}
        itemName={activeTab === 'aspirations' ? "aspiration message" : "task"}
      />

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filterState={appliedFilters}
        onApply={(filters) => setAppliedFilters(filters)}
      />

    </div>
  );
}
