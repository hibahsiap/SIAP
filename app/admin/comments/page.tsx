"use client";

import { useState } from "react";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { InteractionTabs } from "@/components/InteractionTabs";
import { TimeRange } from "@/components/TimeRange";
import { Pagination } from "@/components/Paginations";
import { Plus, Trash2 } from "lucide-react";
import { InteractionStore } from "@/components/InteractionStore";
import CreateDeleteModals from "@/components/SocialModal";

export default function SocialInteractionsPage() {
  const [activeTab, setActiveTab] = useState('comments');
  const [selectedRange, setSelectedRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { openCreateTicketModal, openDeleteModal } = InteractionStore();

  // Data Dummy
  const commentsData = [
    { id: "1", time: "2/27/2026 9:55:48 AM", username: "siti.pdkeotuiewj", message: "Coba isi pesan ini lagi", destination: "diskominfo_karanganyar" },
    { id: "2", time: "2/27/2026 9:55:48 AM", username: "siti.pdkeotuiewj", message: "Coba isi pesan ini lagi", destination: "diskominfo_karanganyar" },
  ];

  const mentionsData = [
    { id: "3", time: "2/27/2026 9:55:48 AM", username: "siti.pdkeotuiewj", message: "Coba isi pesan ini lagi", destination: "excanggga.dev" },
  ];

  const itemsPerPage = 5; 
  const totalItems = activeTab === 'comments' ? commentsData.length : mentionsData.length;

  const currentData = (activeTab === 'comments' ? commentsData : mentionsData).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const columns: ColumnDefinition[] = [
    { header: "Time", key: "time" },
    { header: "Username", key: "username" },
    { header: "Message Content", key: "message" },
    { header: "Destination Account", key: "destination" },
    { 
      header: "Actions", 
      key: "actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <button onClick={() => openCreateTicketModal(row, activeTab as 'comments' | 'mentions')}>
            <Plus size={16}/>
          </button>
          <button onClick={() => openDeleteModal(row, activeTab as 'comments' | 'mentions')}>
            <Trash2 size={16}/>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#041942]">Sosial Interactions</h1>
        <p className="text-gray-500 text-sm">Manage comments from social media here</p>
      </div>
    
      {/* Interaction Tabs dan Time Range */}
      <div className="flex justify-between items-center mb-8">
        <InteractionTabs 
          tabs={[{id: 'comments', label: 'Comments'}, {id: 'mentions', label: 'Mentions'}]}
          activeTab={activeTab} 
          onChange={(id) => {
            setActiveTab(id);
            setCurrentPage(1); 
          }} 
        />
        <TimeRange
          options={timeOptions}
          value={selectedRange}
          onChange={setSelectedRange}
        />
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-t-lg border border-gray-100 shadow-sm min-h-[550px] flex flex-col">        
        <div className="p-6 pb-0">
          <h2 className="text-2xl font-bold text-[#041942] mb-6 capitalize tracking-tight">
            {activeTab} List
          </h2>
          
            <div className="flex-grow">
            <TableTemplate 
                columns={columns} 
                data={currentData} 
            />
            <CreateDeleteModals />
            </div>
        </div>
        
        {/* Pagination */}
        <div className="mt-auto">
          <Pagination 
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}