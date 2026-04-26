"use client";

import React from 'react';
import Header from '@/components/Header';
import TableTemplate2, { ColumnDefinition } from '@/components/TableTemplate2';
import { Type, ArrowUpRight, Sun, Circle, ChevronDown, Calendar, CalendarDays, MessageSquare, CircleChevronDown } from 'lucide-react';

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

const columns: ColumnDefinition[] = [
  { 
    header: <><span className="font-serif text-[15px] font-semibold mr-0.5">Aa</span> Task Name</>, 
    key: "taskName", 
    cell: (val) => <span className="whitespace-normal min-w-[150px] inline-block text-left">{val}</span> 
  },
  { header: <><ArrowUpRight className="w-4 h-4"/> OPD</>, key: "opd" },
  { header: <><Sun className="w-4 h-4"/> Status</>, key: "status", cell: (val) => getStatusBadge(val) },
  { header: <><CircleChevronDown className="w-4 h-4"/> Issue Type</>, key: "issueType", cell: (val) => getBadge(val, 'issue') },
  { header: <><CircleChevronDown className="w-4 h-4"/> Priority</>, key: "priority", cell: (val) => getBadge(val, 'priority') },
  { header: <><Calendar className="w-4 h-4"/> Star Date</>, key: "startDate" },
  { header: <><CalendarDays className="w-4 h-4"/> Due Date</>, key: "dueDate" },
  { 
    header: "Pesan Aspirasi", 
    key: "message", 
    cell: (val) => <span className="block min-w-[250px] max-w-[550px] text-[12px] font-normal leading-relaxed whitespace-normal normal-case text-justify text-[#1D2F58]">{val}</span> 
  },
];

const data = [
  {
    id: 1,
    taskName: "Laporan Kemajuan dan Keuangan",
    opd: "Dinas Sosial",
    status: "On Hold",
    issueType: "Social",
    priority: "Low",
    startDate: "Januari, 9 2026",
    dueDate: "April, 20 2026",
    message: "Lorem ipsum dolor sit amet consectetur. Pellentesque ornare nisl ullamcorper faucibus ut sed libero egestas sit. Lorem ipsum dolor sit amet consectetur. Pellentesque ornare nisl ullamcorper faucibus ut sed libero egestas sit.",
  },
  {
    id: 2,
    taskName: "Laporan Kemajuan dan Keuangan",
    opd: "Dinas Sosial",
    status: "In Progress",
    issueType: "Health",
    priority: "High",
    startDate: "Januari, 9 2026",
    dueDate: "April, 20 2026",
    message: "Lorem ipsum dolor sit amet consectetur. Pulvinar suspendisse est egestas amet pretium tincidunt nunc.",
  },
  {
    id: 3,
    taskName: "Laporan Kemajuan dan Keuangan",
    opd: "Dinas Sosial",
    status: "Done",
    issueType: "Traffic",
    priority: "Low",
    startDate: "Januari, 9 2026",
    dueDate: "April, 20 2026",
    message: "Lorem ipsum dolor sit amet consectetur. Pharetra quis faucibus facilisis et egestas eget tellus. Ipsum pellentesque volutpat gravida enim et morbi tempus.",
  },
];

export default function TicketsPage() {
  return (
    <div className="flex-1 w-full h-full p-6 md:p-8 bg-white">
      <div className="w-full mx-auto space-y-12">

        <Header />

        <div className="overflow-x-auto shadow-sm w-full">
          <TableTemplate2 columns={columns} data={data as any} />
        </div>

      </div>
    </div>
  );
}