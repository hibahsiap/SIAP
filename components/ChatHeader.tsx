"use client";

import { TimeRange } from "@/components/TimeRange";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ToastFrame from "./ToastFrame";
import ReturnAdminButton from "./ReturnAdminButton";
import { DUMMY_TASK } from "@/constants/taskDummy";

export const ChatHeader = ({ name, phone, role, chatId }: { name: string, phone: string, role: 'ADMIN' | 'OPD', chatId: string }) => {
  const [urgency, setUrgency] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const urgencyOptions = [
    { value: 'low', label: 'Low', colorClass: 'bg-green-100 text-green-700' },
    { value: 'medium', label: 'Medium', colorClass: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', colorClass: 'bg-red-100 text-red-700' },
  ];

  const categoryOptions = [
    { value: 'question', label: 'Question', colorClass: 'bg-orange-100 text-orange-800' },
    { value: 'feedback', label: 'Feedback', colorClass: 'bg-purple-100 text-purple-700' },
    { value: 'complaint', label: 'Complaint', colorClass: 'bg-pink-100 text-pink-700' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do', colorClass: 'bg-red-100 text-red-700' },
    { value: 'inprogress', label: 'In Progress', colorClass: 'bg-blue-100 text-blue-700' },
    { value: 'done', label: 'Done', colorClass: 'bg-green-100 text-green-700' },
    { value: 'onhold', label: 'On Hold', colorClass: 'bg-orange-100 text-orange-800' },
    { value: 'cancelled', label: 'Cancelled', colorClass: 'bg-gray-200 text-gray-700' },
  ];

  // const { chatId } = await params
  const task = { ...DUMMY_TASK, chatId }

  // Header Chat
  return (
    <div className="p-4 border-b flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 leading-tight">{name}</h3>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> {phone}
          </p>
        </div>
      </div>
      
      {role === 'ADMIN' ? (
        <div className="flex gap-2">
          <div className="min-w-[100px]">
            <TimeRange 
              prefixLabel="Urgency"
              options={urgencyOptions}
              value={urgency}
              onChange={setUrgency}
              variant="badge"
            />
          </div>
          <div className="min-w-[100px]">
            <TimeRange 
              prefixLabel="Category"
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              variant="badge"
            />
          </div>
          <div className="min-w-[100px]">
            <TimeRange 
              prefixLabel="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
              variant="badge"
            />
          </div>
        </div>
      ) : (
        <ReturnAdminButton task={task}/>
      )}
    </div>
  );
};

// Forward Chat
export const ForwardControl = ({ chatId, name }: { chatId: string, name: string }) => {
  const [selectedOPD, setSelectedOPD] = useState<string>("");
  const [triggerToast, setTriggerToast] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);

  const handleForward = () => {
    if (!selectedOPD) {
      // alert("Silakan pilih OPD tujuan terlebih dahulu!");
      setTriggerToast(false); // Reset dulu
      setIsSuccess(false);    // Set status error/cancel
      setTimeout(() => setTriggerToast(true), 10); // Jalankan toast
      return;
    }
    
    // Masukkan API
    console.log("Meneruskan pesan ke:", selectedOPD);
    // alert(`Pesan berhasil diteruskan ke ${selectedOPD}`);
    // alert("Profil berhasil diperbarui!");
    setTriggerToast(false); // Reset dulu
    setIsSuccess(true);     // Set status sukses
    setTimeout(() => setTriggerToast(true), 10); // Jalankan toast
  };

  return (
    <div className="m-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
        Internal Routing
      </label>
      <div className="flex gap-2">
        <Select value={selectedOPD} onValueChange={setSelectedOPD}>
          <SelectTrigger className="flex-1 bg-white border-gray-200 text-slate-600">
            <SelectValue placeholder="Select OPD to Forward..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diskominfo">Diskominfo</SelectItem>
            <SelectItem value="sekda">Sekretariat Daerah</SelectItem>
            <SelectItem value="dinsos">Dinas Sosial</SelectItem>
          </SelectContent>
        </Select>

        <button 
          onClick={handleForward}
          className="bg-[#1e293b] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#0f172a] active:scale-95 transition-all shadow-sm"
        >
          Forward Chat
        </button>
        {triggerToast && (
          <ToastFrame 
            isSuccess={isSuccess} 
            id={chatId} 
            name={name}
            process={isSuccess ? "forwarded" : undefined} 
          />
        )}
      </div>
    </div>
  );
};