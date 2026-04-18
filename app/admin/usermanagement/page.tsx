"use client" // 1. Wajib ada ini di baris pertama

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ModalAddUser from "@/components/modal-adduser" 
import ModalEditUser from "@/components/modal-edituser"
import ModalDeleteUser from "@/components/modal-deleteuser"
import { useUserStore } from "@/store/useUserStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Pencil, Trash2, Folder, FolderOpen, FileCheck, File, FileText, PlaySquare } from "lucide-react"

// Coba ubah array ini menjadi kosong `const dummyUsers = []` 
// untuk melihat perubahan ke tampilan Empty State!
const dummyUsers = [
  { id: "1", name: "Siti Pertiwi", email: "siti.p@dept.go.id", phone: "+62 811-9876-5432", role: "OPD", initials: "SP", opd: "Dinas Komunikasi dan Informatika" },
  { id: "2", name: "Andi Saputra", email: "andi.s@siap.go.id", phone: "+62 813-2244-6688", role: "ADMIN", initials: "AS", opd: "Sekretariat Daerah" },
  { id: "3", name: "Budi Wahyudi", email: "budi.w@dept.go.id", phone: "+62 812-1111-2222", role: "OPD", initials: "BW", opd: "Dinas Kesehatan" },
]

export default function UserManagementPage() {
  // 2. Wajib dipanggil di sini agar fungsinya bisa dipakai
  const { openEditModal, openDeleteModal } = useUserStore()
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Bagian Header Putih */}
      <div className="bg-white p-6 rounded-t-xl border border-b-0 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#14234b]">User Management</h2>
        
        <div className="flex gap-4">
          {/* Input dengan icon search di dalamnya */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search" 
              className="pl-9 w-62.5 bg-gray-50/50" 
            />
          </div>
          <ModalAddUser />
        </div>
      </div>

      {/* Area Konten Utama */}
      <div className="bg-white border border-t-0 rounded-b-xl flex flex-col shadow-sm h-[calc(100vh-180px)]">
        
        {/* Area Atas: Tabel atau Empty State (mengisi sisa ruang yang ada) */}
        <div className="flex-1 overflow-auto">
          {dummyUsers.length === 0 ? (
            
            /* --- TAMPILAN EMPTY STATE PERSIS FIGMA --- */
            <div className="flex flex-col items-center justify-center h-full min-h-100">
              
              {/* Wadah Ilustrasi */}
              <div className="relative w-56 h-56 flex items-center justify-center mb-4">
                
                {/* 3 Cincin Belakang */}
                <div className="absolute inset-0 border-[1.5px] border-gray-100 rounded-full"></div>
                <div className="absolute inset-8 border-[1.5px] border-gray-100 rounded-full"></div>
                <div className="absolute inset-16 border-[1.5px] border-gray-100 rounded-full"></div>

                {/* Icon Utama di Tengah (Folder Merah Solid) */}
                <div className="z-10 bg-white p-2 rounded-full">
                  <FolderOpen className="w-14 h-14 text-black fill-white" strokeWidth={1} />
                </div>

                {/* --- Icon-Icon yang Mengorbit --- */}
                {/* Kiri Atas */}
                <div className="absolute top-[18%] left-[16%] bg-white p-1">
                  <FileCheck className="w-5 h-5 text-black" strokeWidth={1.5} />
                </div>
                {/* Kanan Atas */}
                <div className="absolute top-[10%] right-[20%] bg-white p-1">
                  <Folder className="w-5 h-5 text-black" strokeWidth={1.5} />
                </div>
                {/* Kanan Tengah */}
                <div className="absolute top-[35%] right-[8%] bg-white p-1">
                  <File className="w-4 h-4 text-black" strokeWidth={1.5} />
                </div>
                {/* Kanan Bawah */}
                <div className="absolute bottom-[20%] right-[16%] bg-white p-1.5">
                  <FileText className="w-6 h-6 text-black fill-white" />
                </div>
                {/* Tengah Bawah */}
                <div className="absolute bottom-[5%] left-[45%] bg-white p-1">
                  <File className="w-4 h-4 text-black" strokeWidth={1.5} />
                </div>
                {/* Kiri Tengah */}
                <div className="absolute top-[50%] left-[3%] bg-white p-1">
                  <PlaySquare className="w-6 h-6 text-black" strokeWidth={1.5} />
                </div>
              </div>

              {/* Teks & Tombol */}
              <h3 className="text-xl font-bold text-gray-900 mt-2">No users found</h3>
              <p className="text-[14px] text-gray-400 mt-2 text-center max-w-sm leading-relaxed">
                There is currently no data available. <br/>
                Please add new data to see it displayed here.
              </p>
              <Button className="mt-6 bg-[#172033] hover:bg-[#172033]/90 text-white font-medium px-5 py-5 flex items-center gap-2 rounded-lg">
                <Plus className="w-4 h-4" /> NEW USER
              </Button>
            </div>

          ) : (

            /* --- TAMPILAN TABEL ADA DATA --- */
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b-2">
                  <TableHead className="w-75 font-bold text-gray-500 text-xs tracking-wider">NAME</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs tracking-wider">EMAIL</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs tracking-wider">PHONE NUMBER</TableHead>
                  <TableHead className="font-bold text-gray-500 text-xs tracking-wider">ROLE</TableHead>
                  <TableHead className="text-right font-bold text-gray-500 text-xs tracking-wider pr-8">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="flex items-center gap-4 font-semibold text-gray-700 py-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-bold border">
                        {user.initials}
                      </div>
                      {user.name}
                    </TableCell>
                    <TableCell className="text-gray-500">{user.email}</TableCell>
                    <TableCell className="text-gray-500">{user.phone}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-gray-100 border text-gray-600 rounded-md text-[11px] font-bold tracking-wider">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-3 text-gray-400">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-gray-100 rounded-md hover:text-[#14234b] transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                        onClick={() => openDeleteModal(user)}
                        className="p-2 hover:bg-red-50 rounded-md hover:text-red-600 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* --- BAGIAN PAGINATION SELALU MUNCUL DI BAWAH --- */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-white mt-auto rounded-b-xl">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-gray-900">{dummyUsers.length > 0 ? "4" : "0"}</span> of <span className="font-bold text-gray-900">{dummyUsers.length > 0 ? "24" : "0"}</span> registered users
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md text-gray-400 border-gray-200">{"<"}</Button>
            <Button variant="default" size="icon" className="w-8 h-8 rounded-md bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-medium">1</Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100">2</Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100">3</Button>
            <Button variant="outline" size="icon" className="w-8 h-8 rounded-md text-gray-400 border-gray-200">{">"}</Button>
          </div>
        </div>
      </div>
      <ModalEditUser />
      <ModalDeleteUser />
    </div>
  );
}