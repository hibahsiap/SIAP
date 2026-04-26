"use client";

import { InteractionStore } from "@/components/InteractionStore";
import CustomModal from "@/components/custom-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Field from "@/components/Field";

export default function CreateDeleteModals() {
  const { 
    isCreateTicketModalOpen, closeCreateTicketModal, 
    isDeleteModalOpen, closeDeleteModal, 
    selectedItem, context 
  } = InteractionStore();

  return (
    <>
      {/* 1. MODAL CREATE NEW TICKET */}
      <CustomModal 
        isOpen={isCreateTicketModalOpen} 
        onClose={closeCreateTicketModal} 
        title={`Create New Ticket from ${context === 'comments' ? 'Comments' : 'Mentions'}`}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-500 -mt-4">
            A new ticket will be created from this message. 
            You can assign it to the relevant department and categorize it accordingly.
          </div>
          
          <Field 
            title="TITLE" 
            placeholder="Masukkan judul tiket..." 
            value={selectedItem?.message || ""} 
            onChange={() => {}} 
          />

          {/* Wrapper Select Fields */}
          <div className="space-y-4">
            {['ASSIGNED OPD', 'CATEGORY', 'CLASIFICATION'].map((label) => (
              <div key={label} className="w-full flex flex-col gap-1">
                <label className="font-semibold text-[12px] uppercase text-[#546064]">{label}</label>
                <Select>
                  <SelectTrigger className="w-full h-[45px] border-[#D2D2D2] text-xs rounded-lg">
                    <SelectValue placeholder={`Pilih ${label}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dinas Komunikasi dan Informatika</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-1">
             <label className="font-semibold text-[12px] uppercase text-[#546064]">ADMIN NOTES</label>
             <Textarea className="border-[#D2D2D2] text-xs rounded-lg min-h-[90px]" placeholder="Notes" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={closeCreateTicketModal} variant="outline" className="flex-1 h-[45px] rounded-lg">CANCEL</Button>
            <Button onClick={closeCreateTicketModal} className="flex-1 h-[45px] bg-[#1a233a] rounded-lg text-white">CREATE TICKET</Button>
          </div>
        </div>
      </CustomModal>

      {/* 2. MODAL DELETE */}
      <CustomModal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal} 
        title="Do you want to delete?" 
        isAlert={true} 
      >
       <p className="text-sm text-gray-500 my-1 text-center">
          {context === 'comments' 
            ? "This comment will be permanently deleted." 
            : "This mention will be permanently deleted."}
        </p>

        <div className="flex gap-3 w-full mt-3">
          <Button onClick={closeDeleteModal} variant="outline" className="flex-1 h-[45px] rounded-lg">CANCEL</Button>
          <Button onClick={closeDeleteModal} className="flex-1 h-[45px] bg-[#1a233a] rounded-lg text-white">DELETE</Button>
        </div>
      </CustomModal>
    </>
  );
}