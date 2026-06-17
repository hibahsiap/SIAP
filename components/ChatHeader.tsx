"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReturnAdminButton from "./ReturnAdminButton";
import type { ReturnTicketOption } from "@/store/useReturnStore";

interface ChatHeaderAdminProps {
  opds: { id: string; name: string }[];
  selectedOpdId: string;
  onSelectOpd: (id: string) => void;
  isSelectMode: boolean;
  selectedCount: number;
  isForwarding: boolean;
  onToggleSelectMode: () => void;
  onForward: () => void;
}

export const ChatHeader = ({
  name, phone, role, avatarUrl, tickets,
  opds, selectedOpdId, onSelectOpd,
  isSelectMode, selectedCount, isForwarding,
  onToggleSelectMode, onForward,
}: {
  name: string;
  phone: string;
  role: 'ADMIN' | 'OPD';
  chatId: string;
  avatarUrl?: string | null;
  tickets?: ReturnTicketOption[];
} & Partial<ChatHeaderAdminProps>) => {

  return (
    <div className="p-4 border-b flex justify-between items-center gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-white font-bold flex-shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.currentTarget as HTMLImageElement;
                t.style.display = 'none';
                (t.parentElement as HTMLElement).textContent = name.charAt(0);
              }}
            />
          ) : (
            name.charAt(0)
          )}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 leading-tight">{name}</h3>
          <p className="text-xs text-gray-400">{phone}</p>
        </div>
      </div>

      {role === 'ADMIN' ? (
        <div className="flex items-center gap-2 flex-1 justify-end">
          {!isSelectMode ? (
            <>
              <Select value={selectedOpdId ?? ""} onValueChange={onSelectOpd}>
                <SelectTrigger className="w-64 bg-white border-gray-200 text-slate-600 text-sm h-9">
                  <SelectValue placeholder={opds && opds.length > 0 ? "Select OPD to forward to..." : "Loading OPDs..."} />
                </SelectTrigger>
                <SelectContent>
                  {(opds ?? []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={onToggleSelectMode}
                disabled={!selectedOpdId}
                className="bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f172a] disabled:opacity-40 transition-all h-9"
              >
                Select Messages
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-slate-500">
                {selectedCount ?? 0} message{(selectedCount ?? 0) !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={onToggleSelectMode}
                className="text-sm border border-gray-300 px-4 py-2 rounded-lg h-9 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onForward}
                disabled={selectedCount === 0 || isForwarding}
                className="bg-[#1e293b] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f172a] disabled:opacity-40 transition-all flex items-center gap-2 h-9"
              >
                {isForwarding && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Forward{(selectedCount ?? 0) > 0 ? ` (${selectedCount})` : ""}
              </button>
            </>
          )}
        </div>
      ) : (
        tickets && tickets.length > 0 ? <ReturnAdminButton tickets={tickets} /> : null
      )}
    </div>
  );
};

interface ForwardControlProps {
  opds: { id: string; name: string }[];
  selectedOpdId: string;
  onSelectOpd: (id: string) => void;
  isSelectMode: boolean;
  selectedCount: number;
  isForwarding: boolean;
  onToggleSelectMode: () => void;
  onForward: () => void;
}

export const ForwardControl = ({
  opds,
  selectedOpdId,
  onSelectOpd,
  isSelectMode,
  selectedCount,
  isForwarding,
  onToggleSelectMode,
  onForward,
}: ForwardControlProps) => {
  return (
    <div className="m-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">
        Forward to OPD
      </label>

      {opds.length === 0 ? (
        <p className="text-xs text-gray-400">
          Loading OPDs...
        </p>
      ) : !isSelectMode ? (
        <div className="flex gap-2">
          <Select value={selectedOpdId} onValueChange={onSelectOpd}>
            <SelectTrigger className="flex-1 bg-white border-gray-200 text-slate-600 text-sm">
              <SelectValue placeholder="Select OPD to forward to..." />
            </SelectTrigger>
            <SelectContent>
              {opds.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={onToggleSelectMode}
            disabled={!selectedOpdId}
            className="bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0f172a] disabled:opacity-40 transition-all shadow-sm"
          >
            Select Messages
          </button>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <span className="text-xs text-slate-500 flex-1">
            {selectedCount} message{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={onToggleSelectMode}
            className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onForward}
            disabled={selectedCount === 0 || isForwarding}
            className="bg-[#1e293b] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#0f172a] disabled:opacity-40 transition-all flex items-center gap-2"
          >
            {isForwarding && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Forward{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
        </div>
      )}
    </div>
  );
};