import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";

interface ForwardTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ForwardTicketModal({ isOpen, onClose, onConfirm }: ForwardTicketModalProps) {
  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Move Ticket to All Tickets?" isAlert={true}>
      <p className="text-[14px] text-gray-400 mt-1 mb-6 text-center leading-relaxed max-w-xs font-medium">
        This ticket will be forwarded to All Tickets and set as ready to process.
      </p>

      <div className="flex gap-3 w-full mt-2 font-sans">
        <Button 
          onClick={onClose} 
          variant="outline" 
          className="flex-1 h-12 bg-[#EAECEF] hover:bg-[#DCDFE3] border-0 text-[#1a233a] font-bold rounded-xl transition-colors tracking-wide text-xs"
        >
          CANCEL
        </Button>
        <Button 
          onClick={onConfirm} 
          className="flex-1 h-12 bg-[#1a233a] hover:bg-[#0f172a] text-white font-bold rounded-xl transition-colors tracking-wide text-xs"
        >
          MOVE
        </Button>
      </div>
    </CustomModal>
  );
}