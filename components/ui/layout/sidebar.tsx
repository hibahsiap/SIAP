import Link from "next/link";
import Image from "next/image";
import { MessageSquare, BarChart2, Users, Ticket, Share2, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-[260px] bg-[#223354] text-gray-300 flex flex-col h-screen sticky top-0">
      {/* Bagian Logo */}
      <div className="p-6 flex items-center gap-3">
        {/* Ganti '/logo.png' dengan nama file logomu di folder public */}
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
             {/* Jika belum ada logo, teks 'S' ini akan muncul. Nanti uncomment tag <Image> di bawah kalau logonya sudah ada */}
             <span className="text-[#223354] font-bold text-xl">S</span>
             {/* <Image src="/logo.png" alt="Logo SIAP" width={40} height={40} className="object-contain" /> */}
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight tracking-wide">SIAP</h1>
          <p className="text-[9px] text-gray-400 font-medium tracking-wider">SISTEM INFORMASI ADUAN<br/>PUBLIK</p>
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 mt-6 space-y-1 text-sm font-medium">
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition-colors">
          <MessageSquare className="w-4 h-4" /> Inbox
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition-colors">
          <BarChart2 className="w-4 h-4" /> Reports
        </Link>
        
        {/* Menu Aktif */}
        <Link href="/usermanagement" className="flex items-center gap-3 px-4 py-3 rounded-md bg-white/10 text-white transition-colors relative">
          <Users className="w-4 h-4" /> User Management
          {/* Garis putih di sebelah kiri (Indikator aktif) */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-md" />
        </Link>
        
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition-colors">
          <Ticket className="w-4 h-4" /> Tickets
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition-colors">
          <Share2 className="w-4 h-4" /> Social Media
        </Link>
      </nav>

      {/* Menu Bawah */}
      <div className="p-4 space-y-1 text-sm font-medium">
        <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-white/5 transition-colors">
          <Settings className="w-4 h-4" /> Settings
        </Link>
        <Link href="#" className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">A</div>
            <span>Admin</span>
          </div>
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}