'use client';

import { Inbox, MessageSquareText, MessageSquare, Kanban, FileText, Ticket, Settings, User, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#1e293b] text-white flex flex-col p-4 border-r border-slate-700">
      {/* Logo & Branding */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl p-1.5 shadow-md">
          <Image src="/logo_siap.png" alt="Logo SIAP" width={38} height={38} className="object-contain" priority />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">SIAP</h1>
          <p className="text-[10px] uppercase text-slate-400 tracking-wider">Sistem Informasi Aduan Publik</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {/* Inbox dengan Submenu */}
        <div className="space-y-1">
          <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard' ? 'bg-slate-700/80' : 'hover:bg-slate-700/50'}`}>
            <Inbox size={20} /> <span className="font-medium text-sm">Inbox</span>
          </Link>
          {/* Submenu Chat & Comments */}
          <div className="pl-1 space-y-1 border-l ml-6 border-slate-600">
            <Link href="/dashboard/chat" className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${pathname === '/inbox/chat' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              <MessageSquare size={16} /> Chat
            </Link>
            <Link href="/dashboard/social" className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${pathname === '/dashboard/social' ? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:text-white'}`}>
              <MessageSquareText size={16} /> Comments
            </Link>
          </div>
        </div>

        {/* Menu Lainnya */}
        <Link href="/tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700/50"><Ticket size={20} /> <span className="font-medium text-sm">Tickets</span></Link>
        <Link href="/dashboard/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700/50"><FileText size={20} /> <span className="font-medium text-sm">Reports</span></Link>
        <Link href="/dashboard/usermanagement" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-700/50"><Users size={20} /> <span className="font-medium text-sm">User Management</span></Link>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-700 pt-4 space-y-1">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 rounded-xl"><Settings size={20} /> <span className="text-sm">Settings</span></Link>
        <Link href="/dashboard/profile" className="flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3"><User size={20} /> <span className="text-sm">Admin</span></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </Link>
      </div>
    </aside>
  );
}