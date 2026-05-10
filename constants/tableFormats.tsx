// src/constants/tableFormats.tsx
import { ReactNode } from "react";
import { IoPencil, IoTrash } from "react-icons/io5";

// Tipe data untuk struktur data yang dikirim dari API
export interface TableRowData {
  initials?: ReactNode;
  id: string;
  name?: string;
  avatarUrl?: string; // Jika ada foto profile
  email?: string;
  phone?: string;
  role?: 'ADMIN' | 'OPD' | 'STAFF';
  category?: string;
  nameOPD?: string;
  totalTickets?: number;
  solvedTickets?: number;
  averageSolvingTime?: string;
  // ... tambahkan properti lain sesuai kebutuhan API
}

// Fungsi Formatter untuk merender kolom 'NAME' (Avatar + Nama)
export const formatNameCell = (rowData: TableRowData): ReactNode => {
  // Ambil inisial nama, misal "Siti Pertiwi" -> "SP"
  const initial = rowData.name
    ? rowData.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "??";

  return (
    <div className="flex items-center gap-3">
      {/* Avatar Bulat dengan Inisial */}
      <div className="w-8 h-8 rounded-[12px] bg-[#3588A3]/20 flex items-center justify-center text-[#546064] text-[12px] font-semibold border border-gray-200 shrink-0">
        {initial}
      </div>
      <span className="font-semibold text-[#041942]">{rowData.name}</span>
    </div>
  );
};

// Fungsi Formatter untuk merender kolom 'ROLE' (Badge)
export const formatRoleCell = (role: TableRowData['role']): ReactNode => {
  const isAdmin = role === 'ADMIN';
  const bgColor = isAdmin ? "bg-[#E8F0FE]" : "bg-gray-100";
  const textColor = isAdmin ? "text-blue-700" : "text-gray-600";
  
  return (
    <div className={`px-3 py-1 inline-block rounded-full font-bold text-[9px] uppercase tracking-wider ${bgColor} ${textColor}`}>
      {role}
    </div>
  );
};

// Fungsi Formatter untuk merender kolom 'ACTIONS' (Tombol Edit/Hapus)
export const formatActionCell = (
  rowData: TableRowData,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ReactNode => {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button 
        onClick={() => onEdit(rowData.id)}
        className="p-1.5 text-[#546064] hover:text-blue-600 transition-colors"
      >
        <IoPencil size={16} />
      </button>
      <button 
        onClick={() => onDelete(rowData.id)}
        className="p-1.5 text-[#546064] hover:text-red-600 transition-colors"
      >
        <IoTrash size={16} />
      </button>
    </div>
  );
};