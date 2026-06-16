import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomModal from "@/components/CustomModal";
import { toast } from "sonner";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: any;
}

export default function EditTicketModal({ isOpen, onClose, ticketData }: EditTicketModalProps) {

  const [title, setTitle] = useState("");
  const [opd, setOpd] = useState("");
  const [classification, setClassification] = useState("Aduan");
  const [issueType, setIssueType] = useState("");
  const [priority, setPriority] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (ticketData) {
      setTitle(ticketData.taskName || ticketData.pengirim || "Perbaikan alur penyampaian aspirasi dan aduan");
      setOpd(ticketData.opd || "Dinas Komunikasi dan Informatika");
      setClassification(ticketData.classification || "Aduan");
      setIssueType(ticketData.issueType || "Layanan Publik");
      setPriority(ticketData.priority || "Low");
      setMessage(ticketData.message || "");
    }
  }, [ticketData]);

  if (!ticketData) return null;

  const handleEditConfirm = () => {
    onClose();
    toast.success("Ticket Update Successfully");
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Edit Detail Ticket" size="lg">
      <div className="mb-2 space-y-0.5">
        <p className="text-[13px] text-gray-400 font-medium tracking-wide">This box will be used to update the ticket details.</p>
        <p className="text-[13px] text-gray-400 font-medium tracking-wide">Please review ensure it is assigned to the correct department and category.</p>
      </div>

      <div className="space-y-4 font-sans">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-gray-300 w-full" 
          />
        </div>

        {/* Assigned OPD */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned OPD</label>
          <Select value={opd} onValueChange={(val) => setOpd(val)}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih OPD" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Dinas Sosial">Dinas Sosial</SelectItem>
              <SelectItem value="Dinas Komunikasi dan Informatika">Dinas Komunikasi dan Informatika</SelectItem>
              <SelectItem value="Dinas Kesehatan">Dinas Kesehatan</SelectItem>
              <SelectItem value="Dinas Pendidikan">Dinas Pendidikan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Classification */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clasification</label>
          <Select value={classification} onValueChange={(val) => setClassification(val)}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih Klasifikasi" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Aduan">Aduan</SelectItem>
              <SelectItem value="Aspirasi">Aspirasi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issue Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issue Type</label>
          <Select value={issueType} onValueChange={(val) => setIssueType(val)}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih Isu" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Social">Social</SelectItem>
              <SelectItem value="Layanan Publik">Layanan Publik</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Traffic">Traffic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
          <Select value={priority} onValueChange={(val) => setPriority(val)}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih Prioritas" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pesan Aspirasi */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pesan Aspirasi</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Masukkan pesan aspirasi..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[13px] text-[#1a233a] font-medium min-h-[110px] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all resize-none leading-relaxed"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <Button 
          onClick={onClose} 
          variant="outline" 
          className="flex-1 bg-[#EAECEF] hover:bg-[#DCDFE3] border-0 text-[#1a233a] font-bold h-10 rounded-lg transition-colors"
        >
          CANCEL
        </Button>
        <Button 
          onClick={handleEditConfirm}
          className="flex-1 bg-[#1a233a] hover:bg-[#0f172a] text-white font-bold h-10 rounded-lg transition-colors"
        >
          EDIT TICKET
        </Button>
      </div>
    </CustomModal>
  );
}