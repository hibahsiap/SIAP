import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ModalAddUser from "@/components/modal-adduser" 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Pencil, Trash2, FolderOpen } from "lucide-react"

// Coba ubah array ini menjadi kosong `const dummyUsers = []` 
// untuk melihat perubahan ke tampilan Empty State!
const dummyUsers = [
  { id: "1", name: "Siti Pertiwi", email: "siti.p@dept.go.id", phone: "+62 811-9876-5432", role: "OPD", initials: "SP" },
  { id: "2", name: "Andi Saputra", email: "andi.s@siap.go.id", phone: "+62 813-2244-6688", role: "ADMIN", initials: "AS" },
  { id: "3", name: "Budi Wahyudi", email: "budi.w@dept.go.id", phone: "+62 812-1111-2222", role: "OPD", initials: "BW" },
]

export default function UserManagementPage() {
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
              className="pl-9 w-[250px] bg-gray-50/50" 
            />
          </div>
          <ModalAddUser />
        </div>
      </div>

      {/* Area Konten Utama (Conditional Rendering) */}
      <div className="bg-white border border-t-0 rounded-b-xl overflow-hidden shadow-sm">
        
        {/* LOGIKA IF-ELSE: Jika data kosong, tampilkan ilustrasi. Jika ada, tampilkan tabel */}
        {dummyUsers.length === 0 ? (
          
          /* --- TAMPILAN EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-32">
            {/* Ilustrasi Lingkaran & Folder */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              <div className="absolute inset-0 border border-gray-100 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-4 border border-gray-100 rounded-full"></div>
              <div className="absolute inset-8 border border-gray-100 rounded-full"></div>
              <div className="bg-white p-4 rounded-full shadow-sm z-10">
                <FolderOpen className="w-12 h-12 text-black" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900">No users found</h3>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
              There is currently no data available. <br/>
              Please add new data to see it displayed here.
            </p>
            <Button className="mt-6 bg-[#1a233a] hover:bg-[#1a233a]/90 flex items-center gap-2">
              <Plus className="w-4 h-4" /> NEW USER
            </Button>
          </div>

        ) : (

          /* --- TAMPILAN TABEL ADA DATA --- */
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-b-2">
                  <TableHead className="w-[300px] font-bold text-gray-500 text-xs tracking-wider">NAME</TableHead>
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
                        <button className="p-2 hover:bg-gray-100 rounded-md hover:text-[#14234b] transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-md hover:text-red-600 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Bagian Pagination Bawah */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">3</span> of <span className="font-bold text-gray-900">24</span> registered users
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="w-8 h-8 rounded-md text-gray-400 border-gray-200">{"<"}</Button>
                <Button variant="default" size="icon" className="w-8 h-8 rounded-md bg-[#1a233a] hover:bg-[#1a233a]/90">1</Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-gray-500">2</Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md text-gray-500">3</Button>
                <Button variant="outline" size="icon" className="w-8 h-8 rounded-md text-gray-400 border-gray-200">{">"}</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}