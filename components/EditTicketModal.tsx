import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomModal from "@/components/CustomModal";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: any;
}

export default function EditTicketModal({ isOpen, onClose, ticketData }: EditTicketModalProps) {
  if (!ticketData) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Edit Detail Ticket" size="lg">
      <div className="mb-6">
        <p className="text-[13px] text-gray-500">This box will be used to update the ticket details.</p>
        <p className="text-[13px] text-gray-500">Please review ensure it is assigned to the correct department and category.</p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Title</label>
          <Input 
            value={ticketData.taskName || ticketData.pengirim || "Perbaikan alur penyampaian aspirasi dan aduan"} 
            readOnly
            className="bg-gray-50/50 border-gray-100 text-[#1a233a] font-medium" 
          />
        </div>

        {/* Assigned OPD */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned OPD</label>
          <Select defaultValue={ticketData.opd || "Dinas Komunikasi dan Informatika"}>
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-100 text-[#1a233a] font-medium">
              <SelectValue placeholder="Pilih OPD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dinas Sosial">Dinas Sosial</SelectItem>
              <SelectItem value="Dinas Komunikasi dan Informatika">Dinas Komunikasi dan Informatika</SelectItem>
              <SelectItem value="Dinas Kesehatan">Dinas Kesehatan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clasification */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Clasification</label>
          <Select defaultValue="Aduan">
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-100 text-[#1a233a] font-medium">
              <SelectValue placeholder="Pilih Klasifikasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aduan">Aduan</SelectItem>
              <SelectItem value="Aspirasi">Aspirasi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issue Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Issue Type</label>
          <Select defaultValue={ticketData.issueType || "Layanan Publik"}>
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-100 text-[#1a233a] font-medium">
              <SelectValue placeholder="Pilih Isu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Social">Social</SelectItem>
              <SelectItem value="Layanan Publik">Layanan Publik</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Traffic">Traffic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Priority</label>
          <Select defaultValue={ticketData.priority || "Low"}>
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-100 text-[#1a233a] font-medium">
              <SelectValue placeholder="Pilih Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pesan Aspirasi */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pesan Aspirasi</label>
          <div className="w-full bg-gray-50/50 border border-gray-100 rounded-md p-3 text-[13px] text-[#1a233a] min-h-[60px]">
            {ticketData.message || "Lorem ipsum dolor sit amet."}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button onClick={onClose} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold">CANCEL</Button>
        <Button className="flex-1 bg-[#1a233a] text-white font-bold">EDIT TICKET</Button>
      </div>
    </CustomModal>
  )
}