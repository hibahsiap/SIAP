"use client";

import { InteractionStore } from "@/components/InteractionStore";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteModal from "@/components/DeleteModal";

export default function SocialTicketModal() {
  const { isCreateTicketModalOpen, closeCreateTicketModal, isDeleteModalOpen, closeDeleteModal, selectedItem, context } = InteractionStore();
  const formattedItemName = context === 'comments' ? 'comment' : context === 'mentions' ? 'mentions' : 'message';

  const handleConfirmDelete = () => {
    if (!selectedItem) return;
    console.log(`Menghapus ${context} dengan ID:`, selectedItem.id);
    closeDeleteModal();
  };
  
  return (
    <>
      <CustomModal 
        isOpen={isCreateTicketModalOpen} 
        onClose={closeCreateTicketModal} 
        title={`Create New Ticket from ${context === 'comments' ? 'Comments' : context === 'mentions' ? 'Mentions' : 'Message'}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-500 -mt-4">
            A new ticket will be created from this message. </p>
          <p className="text-sm text-gray-500 -mt-4">You can assign it to the relevant
            department and categorize it accordingly.</p>

          {/* Title field */}
          <div className="w-full flex flex-col gap-1">
            <label className="font-semibold text-[12px] uppercase text-[#546064]">TITLE</label>
            <Input
              defaultValue={selectedItem?.message || ""}
              placeholder="Masukkan judul tiket"
              className="border-[#D2D2D2] text-xs rounded-lg "
            />
          </div>

          {/* Select fields */}
          <div className="space-y-4">
            {['ASSIGNED OPD', 'CATEGORY', 'CLASIFICATION'].map((label) => (
              <div key={label} className="w-full flex flex-col gap-1">
                <label className="font-semibold text-[12px] uppercase text-[#546064]">{label}</label>
                <Select>
                  <SelectTrigger className="w-full h-[45px] border-[#D2D2D2] text-xs rounded-lg">
                    <SelectValue placeholder={`Pilih ${label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Dinas Komunikasi dan Informatika</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Admin Notes */}
          <div className="w-full flex flex-col gap-1">
            <label className="font-semibold text-[12px] uppercase text-[#546064]">ADMIN NOTES</label>
            <Textarea className="border-[#D2D2D2] text-xs rounded-lg min-h-[90px]" placeholder="Notes" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={closeCreateTicketModal} variant="outline" className="flex-1 h-[45px] rounded-lg">
              CANCEL
            </Button>
            <Button onClick={closeCreateTicketModal} className="flex-1 h-[45px] bg-[#1a233a] rounded-lg text-white">
              CREATE TICKET
            </Button>
          </div>
        </div>
      </CustomModal>

      <DeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal} 
        onConfirm={handleConfirmDelete} 
        itemName={formattedItemName} 
      />
    </>
  );
}
