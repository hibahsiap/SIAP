"use client";

import DeleteAlertModal from '@/components/DeleteModal';
import EditTicketModal from '@/components/EditTicketModal';
import EmptyState from '@/components/EmptyState';
import FilterSidebar, { FilterState } from '@/components/Filter';
import ForwardTicketModal from '@/components/ForwardTicketModal';
import Header from '@/components/Header';
import SearchEmptyState from '@/components/SearchEmpty';
import TableTemplate2, { ColumnDefinition } from '@/components/TableTemplate2';
import { allTickets, aspirationTickets, pendingTickets } from '@/constants/ticketsDummy';
import { useTaskStore } from '@/store/useTaskStore';
import { Edit2, Forward, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from "sonner";

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
    <div className={`mx-auto inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${styles[status]}`}>
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
    "High": "bg-red-100/80 text-red-700",
  };
  return <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide ${styles[text]}`}>{text}</span>;
};

type TabCategory = 'pending' | 'all' | 'aspirations'; 

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const { openDeleteModal, isDeleteModalOpen, closeDeleteModal } = useTaskStore();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false); 
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    opds: [],
    classifications: [],
    issues: [],
    priorities: [],
    rangeTime: "",
  });

  const currentData = useMemo(() => {
    if (activeTab === 'pending') return pendingTickets;
    if (activeTab === 'all') return allTickets;
    return aspirationTickets;
  }, [activeTab]);

  // const filteredData = useMemo(() => {
  //   return currentData.filter((item: any) => {
  //     const searchStr = searchQuery.toLowerCase();
  //     const searchField = item.taskName || item.pengirim || "";
  //     return searchField.toLowerCase().includes(searchStr);
  //   });
  // }, [currentData, searchQuery]);

  const filteredData = useMemo(() => {
    return currentData.filter((item: any) => {
      // Filter search query (tidak berubah)
      const searchStr = searchQuery.toLowerCase();
      const searchField = item.taskName || item.pengirim || "";
      if (!searchField.toLowerCase().includes(searchStr)) return false;

      // ✅ TAMBAH: Filter OPD (hanya berlaku jika ada item.opd)
      if (appliedFilters.opds.length > 0 && item.opd) {
        if (!appliedFilters.opds.includes(item.opd)) return false;
      }

      // ✅ TAMBAH: Filter Classification/Status
      if (appliedFilters.classifications.length > 0) {
        if (!appliedFilters.classifications.includes(item.status)) return false;
      }

      // ✅ TAMBAH: Filter Issue Type (hanya berlaku jika ada item.issueType)
      if (appliedFilters.issues.length > 0 && item.issueType) {
        if (!appliedFilters.issues.includes(item.issueType)) return false;
      }

      // ✅ TAMBAH: Filter Priority
      if (appliedFilters.priorities.length > 0) {
        if (!appliedFilters.priorities.includes(item.priority)) return false;
      }

      return true;
    });
  }, [currentData, searchQuery, appliedFilters]); 

  // const activeFilterCount = useMemo(() => {
  //   return appliedFilters.opds.length +
  //     appliedFilters.classifications.length +
  //     appliedFilters.issues.length +
  //     appliedFilters.priorities.length +
  //     (appliedFilters.rangeTime ? 1 : 0);
  // }, [appliedFilters]);

  const handleForwardConfirm = () => {
    setIsForwardModalOpen(false);
    toast.success("Ticket successfully forwarded to All Tickets");
  };

  const columns = useMemo<ColumnDefinition[]>(() => {
    const messageColumn: ColumnDefinition = { 
      header: "Pesan Aspirasi", 
      key: "message", 
      className: "text-center", 
      cell: (val: string) => (
        <span className="block w-full min-w-[250px] whitespace-normal break-words text-[12px] font-normal leading-relaxed text-justify text-[#1D2F58]">
          {val}
        </span> 
      )
    };

    if (activeTab === 'pending') {
      return [
        { 
          header: "Title", 
          key: "taskName", 
          className: "text-center", 
          // Diubah menjadi Link agar bisa diklik ke detail
          cell: (val, row: any) => (
            <Link href={`/admin/tickets/${row.id}`} className="whitespace-normal min-w-[150px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val}
            </Link>
          ) 
        },
        { header: "OPD", key: "opd", className: "text-center" }, 
        { header: "Clasification", key: "status", className: "text-center", cell: (val) => getStatusBadge(val) },
        { header: "Issue Type", key: "issueType", className: "text-center", cell: (val) => getBadge(val, 'issue') },
        { header: "Priority", key: "priority", className: "text-center", cell: (val) => getBadge(val, 'priority') },
        messageColumn,
        { header: "Actions", key: "action", className: "text-center", cell: (_, row) => (
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => { setSelectedTicket(row); setIsEditModalOpen(true); }} className="text-[#1D2F58] hover:text-blue-500 transition-colors duration-300 cursor-pointer"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => { setSelectedTicket(row); setIsForwardModalOpen(true); }} className="text-[#1D2F58] hover:text-green-500 transition-colors duration-300 cursor-pointer"><Forward className="w-4 h-4" /></button>
            </div>
          )
        }
      ];
    } else if (activeTab === 'all') {
      return [
        { 
          header: "Title", 
          key: "taskName", 
          className: "text-center", 
          // Diubah menjadi Link
          cell: (val, row: any) => (
            <Link href={`/admin/tickets/${row.id}`} className="whitespace-normal min-w-[150px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val}
            </Link>
          ) 
        },
        { header: "OPD", key: "opd", className: "text-center" }, 
        { header: "Clasification", key: "status", className: "text-center", cell: (val) => getStatusBadge(val) },
        { header: "Issue Type", key: "issueType", className: "text-center", cell: (val) => getBadge(val, 'issue') },
        { header: "Priority", key: "priority", className: "text-center", cell: (val) => getBadge(val, 'priority') },
        { header: "Start date", key: "startDate", className: "text-center" },
        { header: "Due date", key: "dueDate", className: "text-center" },
        messageColumn
      ];
    } else {
      return [
        { 
          header: "Pengirim", 
          key: "pengirim", 
          className: "text-center", 
          // Pengirim juga kita buat bisa diklik ke detail tiket
          cell: (val, row: any) => (
            <Link href={`/admin/tickets/${row.id}`} className="whitespace-normal min-w-[100px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val}
            </Link>
          ) 
        },
        { header: "Clasification", key: "status", className: "text-center", cell: (val) => getStatusBadge(val) },
        { header: "Priority", key: "priority", className: "text-center", cell: (val) => getBadge(val, 'priority') },
        messageColumn,
        { header: "Action", key: "action", className: "text-center", cell: (_, row) => (
            <button onClick={() => openDeleteModal(row)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )
        }
      ];
    }
  }, [activeTab, openDeleteModal]);

  return (
    <div className="flex-1 h-full px-4 py-2 w-[1020px]">

      {/* --- TABS & SEARCH HEADER --- */}
      <div className="flex flex-row justify-between items-center gap-4 py-4 mb-4">
        <div className="flex gap-2">
          {['pending', 'all', 'aspirations'].map((id) => (
            <button
              key={id}
              onClick={() => { 
                setActiveTab(id as TabCategory); 
                setSearchQuery(""); 
                setAppliedFilters({ opds: [], classifications: [], issues: [], priorities: [], rangeTime: "" });
              }}
              className={`px-5 h-10 flex items-center justify-center rounded-[12px] text-sm font-semibold transition-all duration-200 ${
                activeTab === id ? "bg-[#041942] text-white shadow-md border-[#041942]" : "bg-white text-[#1B1B1B] hover:bg-gray-100 border border-[#D2D2D2]"
              }`}
            >
              {id === 'pending' ? 'Pending Review' : id === 'all' ? 'All Tickets' : 'Aspirations'}
            </button>
          ))}
        </div>
        <div className="w-auto">
            <Header 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              onFilterClick={() => setIsFilterOpen(true)} 
            /> 
        </div>
      </div>

      {/* --- AREA KONTEN --- */}
      <div className="overflow-y-auto custom-scrollbar">
        {filteredData.length > 0 ? (
          <div className="w-full">
            <TableTemplate2 columns={columns} data={filteredData as any} />
          </div>
        ) : searchQuery !== "" ? (
          <SearchEmptyState type={activeTab} />
        ) : (
          <EmptyState 
            title="No files found" 
            description="There is currently no data available. Please add new data to see it displayed here." 
          />
        )}
      </div>

      {/* Modals */}
      <DeleteAlertModal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal} 
        onConfirm={() => { 
          toast.success("Ticket deleted successfully"); 
          closeDeleteModal(); 
        }} 
        itemName={activeTab === 'aspirations' ? "aspiration message" : "task"} 
      />

      <EditTicketModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ticketData={selectedTicket}
      />

      <ForwardTicketModal 
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        onConfirm={handleForwardConfirm}
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