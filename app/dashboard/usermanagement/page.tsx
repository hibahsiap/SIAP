"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import UserModals from "@/components/CrudModal"
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

const dummyUsers = [
  { id: "1", name: "Siti Pertiwi", email: "siti.p@dept.go.id", phone: "+62 811-9876-5432", role: "OPD", initials: "SP", opd: "Dinas Komunikasi dan Informatika" },
  { id: "2", name: "Andi Saputra", email: "andi.s@siap.go.id", phone: "+62 813-2244-6688", role: "ADMIN", initials: "AS", opd: "Sekretariat Daerah" },
  { id: "3", name: "Budi Wahyudi", email: "budi.w@dept.go.id", phone: "+62 812-1111-2222", role: "OPD", initials: "BW", opd: "Dinas Kesehatan" },
]

export default function UserManagementPage() {
  const { openEditModal, openDeleteModal, openAddModal } = useUserStore()
  
  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      
      {/* BAGIAN HEADER */}
      <div className="bg-white px-8 py-6 rounded-t-lg border border-gray-200 border-b-0 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-[#14234b]">User Management</h2>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search" 
              className="pl-9 w-[280px] bg-gray-100 border-transparent focus:bg-white focus:border-gray-300 rounded-md h-10 shadow-none text-sm" 
            />
          </div>
          <Button onClick={openAddModal} className="bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-medium h-10 px-4 rounded-md flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD NEW USER
          </Button>
        </div>
      </div>

      {/* AREA KONTEN */}
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg flex flex-col shadow-sm h-[calc(100vh-160px)]">
        
        <div className="flex-1 overflow-auto">
          {dummyUsers.length === 0 ? (
            /* TAMPILAN EMPTY STATE */
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="relative w-56 h-56 flex items-center justify-center mb-4">
                <div className="absolute inset-0 border-[1.5px] border-gray-100 rounded-full"></div>
                <div className="absolute inset-8 border-[1.5px] border-gray-100 rounded-full"></div>
                <div className="absolute inset-16 border-[1.5px] border-gray-100 rounded-full"></div>
                <div className="z-10 bg-white p-2 rounded-full">
                  <FolderOpen className="w-14 h-14 text-black fill-white" strokeWidth={1} />
                </div>
                <div className="absolute top-[18%] left-[16%] bg-white p-1">
                  <FileCheck className="w-5 h-5 text-black" strokeWidth={1.5} />
                </div>
                <div className="absolute top-[10%] right-[20%] bg-white p-1">
                  <Folder className="w-5 h-5 text-black" strokeWidth={1.5} />
                </div>
                <div className="absolute top-[35%] right-[8%] bg-white p-1">
                  <File className="w-4 h-4 text-black" strokeWidth={1.5} />
                </div>
                <div className="absolute bottom-[20%] right-[16%] bg-white p-1.5">
                  <FileText className="w-6 h-6 text-black fill-white" />
                </div>
                <div className="absolute bottom-[5%] left-[45%] bg-white p-1">
                  <File className="w-4 h-4 text-black" strokeWidth={1.5} />
                </div>
                <div className="absolute top-[50%] left-[3%] bg-white p-1">
                  <PlaySquare className="w-6 h-6 text-black" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-2">No users found</h3>
              <p className="text-[14px] text-gray-400 mt-2 text-center max-w-sm leading-relaxed">
                There is currently no data available. <br/>
                Please add new data to see it displayed here.
              </p>
              <Button onClick={openAddModal} className="mt-6 bg-[#172033] hover:bg-[#172033]/90 text-white font-medium px-5 py-5 flex items-center gap-2 rounded-md">
                <Plus className="w-4 h-4" /> NEW USER
              </Button>
            </div>

          ) : (

            /* TAMPILAN TABEL */
            <Table>
              <TableHeader> 
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-y border-gray-200">  
                  <TableHead className="w-[400px] h-[64px] text-center font-bold text-gray-600 text-base tracking-wider pl-8"> NAME </TableHead> 
                  <TableHead className="text-center font-bold text-gray-600 text-base tracking-wider"> EMAIL </TableHead> 
                  <TableHead className="text-center font-bold text-gray-600 text-base tracking-wider"> PHONE NUMBER </TableHead>
                  <TableHead className="text-center font-bold text-gray-600 text-base tracking-wider"> ROLE </TableHead> 
                  <TableHead className="text-right font-bold text-gray-600 text-base tracking-wider pr-8"> ACTIONS </TableHead> 
                </TableRow> 
              </TableHeader>
              <TableBody>
                {dummyUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                    <TableCell className="flex items-center gap-4 font-bold text-gray-800 py-4 pl-8">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-bold border border-gray-200">
                        {user.initials}
                      </div>
                      {user.name}
                    </TableCell>
                    <TableCell className="text-center text-gray-500 font-medium py-4">{user.email}</TableCell>
                    <TableCell className="text-center text-gray-500 font-medium py-4">{user.phone}</TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-center">
                        <span className="px-5 py-1.5 bg-[#f8f9fa] border border-gray-200 text-[#21335A] rounded-md text-[11px] font-bold tracking-widest">
                          {user.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-8">
                      <div className="flex justify-end gap-2 text-black-400">
                        <button onClick={() => openEditModal(user)} className="p-2 hover:bg-gray-100 rounded-md hover:text-[#14234b] transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDeleteModal(user)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600 transition-all">
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

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-200 bg-white mt-auto rounded-b-lg">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{dummyUsers.length > 0 ? "3" : "0"}</span> of <span className="font-bold text-gray-900">{dummyUsers.length > 0 ? "24" : "0"}</span> registered users
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon" className="w-9 h-9 rounded-md text-gray-400 border-gray-200">{"<"}</Button>
            <Button variant="default" size="icon" className="w-9 h-9 rounded-md bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-semibold">1</Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-md text-gray-500 hover:bg-gray-100 font-medium">2</Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-md text-gray-500 hover:bg-gray-100 font-medium">3</Button>
            <Button variant="outline" size="icon" className="w-9 h-9 rounded-md text-gray-400 border-gray-200">{">"}</Button>
          </div>
        </div>
      </div>
      <UserModals />
    </div>
  );
}