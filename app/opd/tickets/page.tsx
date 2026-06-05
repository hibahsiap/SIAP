"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header'; 
import TableTemplate2, { ColumnDefinition } from '@/components/TableTemplate2';
import EmptyState from '@/components/EmptyState';
import SearchEmptyState from '@/components/SearchEmpty';
import DeleteAlertModal from '@/components/DeleteModal';
import { ArrowUpRight, Loader, CircleChevronDown, Calendar, Trash2, Edit2, Forward } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import FilterSidebar, { FilterState } from '@/components/Filter'; 
import { pendingTickets, allTickets, aspirationTickets} from '@/constants/ticketsDummy';
import KanbanBoard from '@/components/spectrumui/kanbanboard';
import Link from 'next/link';
import { toast } from 'sonner';
import { isWithinRange } from '@/utils/dateFilter';

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    "On Hold": "bg-[#F5E6E0] text-[#B06B52]",
    "In Progress": "bg-[#E0EBFA] text-[#4A80D4]",
    "Done": "bg-[#E3F2E7] text-[#4C9A61]",
  };
  const dotColors: Record<string, string> = {
    "On Hold": "bg-[#B06B52]",
    "In Progress": "bg-[#4A80D4]",
    "Done": "bg-[#4C9A61]",
  };
  return (
    <div className={`mx-auto inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-[11px] 2xl:text-[13px] font-bold tracking-wide ${styles[status]} w-30`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status]}`}></span>
      {status}
    </div>
  );
};

const getBadge = (text: string, type: 'issue' | 'priority') => {
  const styles: Record<string, string> = {
    "Social": "bg-red-100/80 text-red-700",
    "Health": "bg-purple-100/80 text-purple-700",
    "Traffic": "bg-[#F5E6E0] text-[#B06B52]", 
    "Low": "bg-[#E3F2E7] text-[#4C9A61]",
    "Medium": "bg-yellow-100/80 text-yellow-700",
    "High": "bg-red-100/80 text-red-700",
  };
  return <div className={`w-18 px-3 py-1.5 rounded-md text-[11px] 2xl:text-[13px] font-bold tracking-wide ${styles[text]}`}>{text}</div>;
};

type TabCategory = 'kanban' | 'all' | 'aspirations';

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('kanban');
  const [searchQuery, setSearchQuery] = useState("");
  const { openEditModal, openDeleteModal, isDeleteModalOpen, closeDeleteModal } = useTaskStore();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    opds: [],
    classifications: [],
    issues: [],
    priorities: [],
    rangeTime: "",
  });

  const currentData = useMemo(() => {
    if (activeTab === 'all') return allTickets;
    return aspirationTickets;
  }, [activeTab]);

  const filteredData = useMemo(() => {
    const filtered = currentData.filter((item: any) => {
      // Filter search query (tidak berubah)
      const searchStr = searchQuery.toLowerCase();
      const searchField = item.taskName || item.pengirim || "";
      if (!searchField.toLowerCase().includes(searchStr)) return false;

      if (appliedFilters.opds.length > 0 && item.opd) {
        if (!appliedFilters.opds.includes(item.opd)) return false;
      }

      if (appliedFilters.classifications.length > 0) {
        if (!appliedFilters.classifications.includes(item.status)) return false;
      }

      if (appliedFilters.issues.length > 0 && item.issueType) {
        if (!appliedFilters.issues.includes(item.issueType)) return false;
      }

      if (appliedFilters.priorities.length > 0) {
        if (!appliedFilters.priorities.includes(item.priority)) return false;
      }

      if (appliedFilters.rangeTime) {
        if (!isWithinRange(item.startDate, appliedFilters.rangeTime)) return false;
      }

      return true;
    });

    return [...filtered].sort((a: any, b: any) => {
      // Pakai startDate jika ada, fallback ke id
      const getTime = (item: any) => {
        if (item.startDate) {
          const d = new Date(item.startDate);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        }
        return item.id ?? 0;
      };
      return sortOrder === 'newest'
        ? getTime(b) - getTime(a)
        : getTime(a) - getTime(b);
    });

  }, [currentData, searchQuery, appliedFilters, sortOrder]); 

  // Kolom dibuat dinamis berdasarkan Tab yang aktif
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

    if (activeTab === 'kanban') {
      return [];
    } else if (activeTab === 'all') {
      return [
        { 
          header: "Task Name", 
          key: "taskName", 
          // cell: (val) => <span className="whitespace-normal min-w-[150px] inline-block font-bold">{val}</span> 
          cell: (val, row: any) => (
            <Link href={`/opd/task/${row.id}`} className="whitespace-normal w-[180px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val}
            </Link>
          ) 
        },
        { header: "OPD", key: "opd", className: "text-center", cell: (val) => <div className="w-[180px]">{val}</div>,  },
        { header: "Status", key: "status", cell: (val) => getStatusBadge(val) },
        { header: "Issue Type", key: "issueType", cell: (val) => getBadge(val, 'issue') },
        { header: "Priority", key: "priority", cell: (val) => getBadge(val, 'priority') },
        { header: "Start Date", key: "startDate" },
        { header: "Due Date", key: "dueDate" },
        messageColumn
      ];
    } else {
      return [
        { 
          header: "Pengirim", 
          key: "pengirim", 
          className: "text-center", 
          // cell: (val) => <span className="whitespace-normal min-w-[100px] inline-block font-bold">{val}</span> 
          cell: (val, row: any) => (
            <Link href={`/opd/task/${row.id}`} className="whitespace-normal w-[140px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val}
            </Link>
          )
        },
        { header: "Status", key: "status", cell: (val) => getStatusBadge(val) },
        { header: "Priority", key: "priority", cell: (val) => getBadge(val, 'priority') },
        messageColumn,
        { header: "Action", key: "action", cell: (_, row) => (
            <button onClick={() => openDeleteModal(row)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )
        }
      ];
    }
  }, [activeTab, openEditModal, openDeleteModal]);

  return (
    <div className="flex-1 w-[1020px] 2xl:w-[1300px] h-full px-4 py-2 overflow-hidden">

      {/* --- TABS & SEARCH HEADER --- */}
      <div className="flex flex-row justify-between items-center gap-4 py-4 mb-4">
        <div className="flex gap-2">
          {[{ id: 'kanban', label: 'Kanban' },
            { id: 'all', label: 'All Tickets' },
            { id: 'aspirations', label: 'Aspirations' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as TabCategory); setSearchQuery(""); }}
              className={`px-5 h-10 rounded-[12px] text-sm 2xl:text-base 2xl:h-12 font-semibold transition-all duration-200 ${
                activeTab === tab.id ? "bg-[#041942] text-white shadow-md border-[#041942]" : "bg-white text-[#1B1B1B] hover:bg-gray-100 border border-[#D2D2D2]"
              }`}
            >
              {tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}
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

      {/* --- AREA KONTEN (LOGIKA SWITCH) --- */}
      <div className="">
        {activeTab === 'kanban' ? (
          <KanbanBoard searchQuery={searchQuery} filters={appliedFilters} sortOrder={sortOrder} />
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <TableTemplate2 columns={columns} data={filteredData as any} />
          </div>
        ) : searchQuery !== "" ? (
          <SearchEmptyState type={activeTab} />
        ) : (
          <EmptyState 
            title={`There is currently no data available`} 
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