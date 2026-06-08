"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link'; 
import Header from '@/components/Header'; 
import TableTemplate2, { ColumnDefinition } from '@/components/TableTemplate2';
import EmptyState from '@/components/EmptyState';
import SearchEmptyState from '@/components/SearchEmpty';
import DeleteAlertModal from '@/components/DeleteModal';
import EditTicketModal from '@/components/EditTicketModal';
import FilterSidebar from '@/components/Filter'; 
import ForwardTicketModal from '@/components/ForwardTicketModal'; 
import { Trash2, Edit2, Forward, CheckCircle2, Loader2 } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { toast } from "sonner"; 

type TicketItem = {
  id: string;
  ticketNumber: string;
  title: string | null;
  description: string;
  status: string;
  urgency: string | null;
  type: string | null;
  location: string | null;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  citizenName: string;
  opdName: string | null;
  opdId: string | null;
  categoryName: string | null;
  categoryId: string | null;
  channelPlatform: string;
};

const statusLabel: Record<string, string> = {
  ON_HOLD: "On Hold",
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const typeLabel: Record<string, string> = {
  COMPLAINT: "Pengaduan",
  QUESTION: "Pertanyaan",
  FEEDBACK: "Saran",
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    "On Hold": "bg-[#F5E6E0] text-[#B06B52]",
    "To Do": "bg-[#E0EBFA] text-[#4A80D4]",
    "In Progress": "bg-[#E0EBFA] text-[#4A80D4]",
    "Done": "bg-[#E3F2E7] text-[#4C9A61]",
    "Cancelled": "bg-gray-100 text-gray-500",
  };
  const dotColors: Record<string, string> = {
    "On Hold": "bg-[#B06B52]",
    "To Do": "bg-[#4A80D4]",
    "In Progress": "bg-[#4A80D4]",
    "Done": "bg-[#4C9A61]",
    "Cancelled": "bg-gray-500",
  };
  const display = statusLabel[status] ?? status;
  return (
    <div className={`mx-auto inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${styles[display] ?? "bg-gray-100 text-gray-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[display] ?? "bg-gray-500"}`}></span>
      {display}
    </div>
  );
};

const getTypeBadge = (type: string | null) => {
  if (!type) return null;
  const display = typeLabel[type] ?? type;
  const styles: Record<string, string> = {
    Pengaduan: "bg-red-100/80 text-red-700",
    Pertanyaan: "bg-blue-100/80 text-blue-700",
    Saran: "bg-green-100/80 text-green-700",
  };
  return <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide ${styles[display] ?? "bg-gray-100 text-gray-600"}`}>{display}</span>;
};

const getUrgencyBadge = (urgency: string | null) => {
  if (!urgency) return null;
  const display = urgency.charAt(0) + urgency.slice(1).toLowerCase();
  const styles: Record<string, string> = {
    Low: "bg-[#E3F2E7] text-[#4C9A61]",
    Medium: "bg-yellow-100/80 text-yellow-700",
    High: "bg-red-100/80 text-red-700",
    Critical: "bg-red-200/80 text-red-800",
  };
  return <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide ${styles[display] ?? "bg-gray-100 text-gray-600"}`}>{display}</span>;
};

type TabCategory = 'pending' | 'all' | 'aspirations'; 

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const { openDeleteModal, isDeleteModalOpen, closeDeleteModal } = useTaskStore();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false); 
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchTickets = useCallback(async (tab?: TabCategory) => {
    const t = tab ?? activeTab;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets?tab=${t}`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTickets(activeTab);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredData = useMemo(() => {
    if (!searchQuery) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) => {
      return (
        (t.title ?? "").toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        (t.citizenName ?? "").toLowerCase().includes(q)
      );
    });
  }, [tickets, searchQuery]);

  const handleApprove = useCallback(async (ticket: TicketItem) => {
    setApprovingId(ticket.id);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TO_DO" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to approve");
      }
      toast.success(`Ticket ${ticket.ticketNumber} approved`);
      fetchTickets();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setApprovingId(null);
    }
  }, [fetchTickets]);

  const handleForwardConfirm = () => {
    setIsForwardModalOpen(false);
    toast.success("Ticket successfully forwarded to All Tickets");
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const columns = useMemo<ColumnDefinition[]>(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const messageColumn: ColumnDefinition = { 
      header: "Pesan Aspirasi", 
      key: "description", 
      className: "text-center", 
      cell: (val: any) => (
        <span className="block w-full min-w-[250px] whitespace-normal break-words text-[12px] font-normal leading-relaxed text-justify text-[#1D2F58]">
          {val}
        </span> 
      )
    };

    if (activeTab === 'pending') {
      return [
        { 
          header: "Title", 
          key: "title", 
          className: "text-center", 
          cell: (val: any, row: any) => (
            <Link href={`/admin/tickets/${row.id}`} className="whitespace-normal min-w-[150px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val ?? row.ticketNumber}
            </Link>
          ) 
        },
        { header: "OPD", key: "opdName", className: "text-center", cell: (val: any) => val ?? "-" }, 
        { header: "Clasification", key: "status", className: "text-center", cell: (val: any) => getStatusBadge(val) },
        { header: "Type", key: "type", className: "text-center", cell: (val: any) => getTypeBadge(val) },
        { header: "Category", key: "categoryName", className: "text-center", cell: (val: any) => val ?? "-" },
        { header: "Priority", key: "urgency", className: "text-center", cell: (val: any) => getUrgencyBadge(val) },
        messageColumn,
        { header: "Actions", key: "id", className: "text-center", cell: (_: any, row: any) => (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { setSelectedTicket(row as TicketItem); setIsEditModalOpen(true); }} className="text-[#1D2F58] hover:opacity-70 transition-opacity" title="Edit"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => { setSelectedTicket(row as TicketItem); setIsForwardModalOpen(true); }} className="text-[#1D2F58] hover:opacity-70 transition-opacity" title="Forward"><Forward className="w-4 h-4" /></button>
              <button
                onClick={() => handleApprove(row as TicketItem)}
                disabled={approvingId === (row.id as string)}
                className="text-green-600 hover:opacity-70 transition-opacity disabled:opacity-40"
                title="Approve"
              >
                {approvingId === (row.id as string) ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>
          )
        }
      ];
    } else if (activeTab === 'all') {
      return [
        { 
          header: "Title", 
          key: "title", 
          className: "text-center", 
          cell: (val: any, row: any) => (
            <Link href={`/admin/tickets/${row.id}`} className="whitespace-normal min-w-[150px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val ?? row.ticketNumber}
            </Link>
          ) 
        },
        { header: "OPD", key: "opdName", className: "text-center", cell: (val: any) => val ?? "-" }, 
        { header: "Clasification", key: "status", className: "text-center", cell: (val: any) => getStatusBadge(val) },
        { header: "Issue Type", key: "type", className: "text-center", cell: (val: any) => getTypeBadge(val) },
        { header: "Priority", key: "urgency", className: "text-center", cell: (val: any) => getUrgencyBadge(val) },
        { header: "Start date", key: "createdAt", className: "text-center", cell: (val: any) => formatDate(val) },
        { header: "Due date", key: "dueDate", className: "text-center", cell: (val: any) => formatDate(val) },
        messageColumn,
        { header: "Actions", key: "id", className: "text-center", cell: (_: any, row: any) => (
            <button onClick={() => { setSelectedTicket(row as TicketItem); setIsEditModalOpen(true); }} className="text-[#1D2F58] hover:opacity-70 transition-opacity"><Edit2 className="w-4 h-4" /></button>
          )
        }
      ];
    } else {
      return [
        { 
          header: "Pengirim", 
          key: "citizenName", 
          className: "text-center", 
          cell: (val: any, row: any) => (
            <Link href={`/admin/tickets/${row.id}`} className="whitespace-normal min-w-[100px] inline-block font-bold text-[#1D2F58] hover:text-blue-600 hover:underline transition-all">
              {val}
            </Link>
          ) 
        },
        { header: "Clasification", key: "status", className: "text-center", cell: (val: any) => getStatusBadge(val) },
        { header: "Priority", key: "urgency", className: "text-center", cell: (val: any) => getUrgencyBadge(val) },
        messageColumn,
        { header: "Action", key: "id", className: "text-center", cell: (_: any, row: any) => (
            <button onClick={() => openDeleteModal(row)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )
        }
      ];
    }
  }, [activeTab, approvingId, handleApprove, openDeleteModal]);

  return (
    <div className="flex-1 w-full max-w-full h-full p-4 lg:p-8">

      {/* --- TABS & SEARCH HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {['pending', 'all', 'aspirations'].map((id) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id as TabCategory); setSearchQuery(""); }}
              className={`px-5 h-[40px] flex items-center justify-center rounded-[12px] text-sm font-semibold transition-all duration-200 ${
                activeTab === id ? "bg-[#041942] text-white shadow-md border-[#041942]" : "bg-white text-[#1B1B1B] hover:bg-gray-100 border border-[#D2D2D2]"
              }`}
            >
              {id === 'pending' ? 'Pending Review' : id === 'all' ? 'All Tickets' : 'Aspirations'}
            </button>
          ))}
        </div>
        <div className="w-full md:w-auto">
            <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onFilterClick={() => setIsFilterOpen(true)} /> 
        </div>
      </div>

      {/* --- AREA KONTEN --- */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1D2F58]" />
          </div>
        ) : error ? (
          <EmptyState title="Error loading tickets" description={error} />
        ) : filteredData.length > 0 ? (
          <div className="w-full">
            <TableTemplate2 columns={columns} data={filteredData as any} />
          </div>
        ) : searchQuery !== "" ? (
          <SearchEmptyState type={activeTab} />
        ) : (
          <EmptyState 
            title="No tickets found" 
            description="There is currently no data available. Please add new data to see it displayed here." 
          />
        )}
      </div>

      {/* Modals */}
      <DeleteAlertModal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal} 
        onConfirm={() => { closeDeleteModal(); }} 
        itemName={activeTab === 'aspirations' ? "aspiration message" : "task"} 
      />

      <EditTicketModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        ticketData={selectedTicket}
        onSaved={fetchTickets}
      />

      <ForwardTicketModal 
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        onConfirm={handleForwardConfirm}
      />

      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />
      
    </div>
  );
}