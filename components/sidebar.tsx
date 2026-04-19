'use client';

import { Inbox, Kanban, FileText, Ticket, MessageSquare, Settings, User, Users, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; 

export default function Sidebar() {
  const pathname = usePathname(); 

  const menuItems = [
    { name: 'Inbox', icon: <Inbox size={20} />, href: '/inbox' },
    { name: 'Kanban', icon: <Kanban size={20} />, href: '/kanban' },
    { name: 'Reports', icon: <FileText size={20} />, href: '/reports' },
    { name: 'User Management', icon: <Users size={20} />, href: '/users' },
    { name: 'Tickets', icon: <Ticket size={20} />, href: '/tickets' },
    { name: 'Public Aspirations', icon: <MessageSquare size={20} />, href: '/aspirations' },
    { name: 'Social Media', icon: <Share2 size={20} />, href: '/social-media' },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#1e293b] text-white flex flex-col p-4 border-r border-slate-700">
      {/* Logo & Branding */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl p-1.5 shadow-md">
          <Image 
            src="/logo_siap.png"
            alt="Logo SIAP Diskominfo"
            width={38} 
            height={38}
            className="object-contain" 
            priority 
          />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">SIAP</h1>
          <p className="text-[10px] uppercase text-slate-400 tracking-wider">Sistem Informasi Aduan Publik</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-slate-700/80 text-white shadow-lg' 
                  : 'hover:bg-slate-700/50 text-slate-300'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-700 pt-4 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 rounded-xl transition-all text-slate-300">
          <Settings size={20} /> <span className="text-sm">Settings</span>
        </Link>
        <Link href="/admin" className="flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 rounded-xl transition-all text-slate-300">
          <div className="flex items-center gap-3">
            <User size={20} /> <span className="text-sm">Admin</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </Link>
      </div>
    </aside>
  );
}