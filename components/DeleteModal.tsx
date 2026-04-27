import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";

interface DeleteAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string; 
}

export default function DeleteModal({ isOpen, onClose, onConfirm, itemName }: DeleteAlertModalProps) {
  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Do you want to delete?" isAlert={true}>
      <p className="text-[14px] text-gray-500 my-2 text-center">
        This {itemName} will be permanently deleted.
      </p>

      <div className="flex gap-3 w-full mt-5">
        <Button 
          onClick={onClose} 
          variant="outline" 
          className="flex-1 h-[45px] bg-[#F1F3F5] hover:bg-[#E5E7EB] border-0 text-[#1a233a] font-bold rounded-lg"
        >
          CANCEL
        </Button>
        <Button 
          onClick={onConfirm} 
          className="flex-1 h-[45px] bg-[#1a233a] hover:bg-[#0f172a] text-white font-bold rounded-lg"
        >
          DELETE
        </Button>
      </div>
    </CustomModal>
  );
}