// components/chat/ChatHeader.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ChatHeader = ({ name, phone }: { name: string; phone: string }) => (
  <div className="p-4 border-b flex justify-between items-center bg-white">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
        {name.charAt(0)}
      </div>
      <div>
        <h3 className="font-bold text-slate-900">{name}</h3>
        <p className="text-xs text-green-600 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span> {phone}
        </p>
      </div>
    </div>
    
    <div className="flex gap-2">
      <Select><SelectTrigger className="w-32 bg-gray-50 border-none text-xs"><SelectValue placeholder="Select Urgency" /></SelectTrigger></Select>
      <Select><SelectTrigger className="w-32 bg-gray-50 border-none text-xs"><SelectValue placeholder="Select Category" /></SelectTrigger></Select>
      <Select><SelectTrigger className="w-32 bg-gray-50 border-none text-xs"><SelectValue placeholder="Select Status" /></SelectTrigger></Select>
    </div>
  </div>
);

export const ForwardControl = () => (
  <div className="m-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Internal Routing</label>
    <div className="flex gap-2">
      <Select>
        <SelectTrigger className="flex-1 bg-white border-gray-200">
          <SelectValue placeholder="Select OPD to Forward..." />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="diskominfo">Diskominfo</SelectItem>
            <SelectItem value="sekda">Sekretariat Daerah</SelectItem>
        </SelectContent>
      </Select>
      <button className="bg-[#1e293b] text-white px-6 py-2 rounded-lg text-sm font-bold">Forward Chat</button>
    </div>
  </div>
);