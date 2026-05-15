'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SIDEBAR_MENU } from '@/constants/sidebar-menu';
import { SidebarItem } from './sidebar-item';
import { Settings, User, LogOut } from 'lucide-react';

export default function Sidebar({ role }: { role: 'ADMIN' | 'OPD' }) {
  const pathname = usePathname();
  const menuItems = SIDEBAR_MENU[role];

  return (
    <aside className="w-64 h-screen bg-[#1e293b] text-white flex flex-col p-4 border-r border-slate-700">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center">
           <Image 
             src="/images/logo-siap.png" 
             alt="Logo SIAP" 
             width={38} 
             height={38} 
             className="object-contain"
             priority
           />
        </div>
        <div>
          <h1 className="font-bold text-lg">SIAP</h1>
          <p className="text-[10px] text-slate-400 uppercase">Sistem Informasi Aduan Publik</p>
        </div>
      </div>

      {/* Dynamic Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            {...item} 
            isActive={pathname === item.href} 
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-700 pt-4 space-y-1">
        <SidebarItem name="Settings" href={`/${role}/settings`} icon={<Settings size={20} />} isActive={pathname.includes('settings')} />
        <div className="flex items-center justify-between px-4 py-3 text-slate-300">
          <div className="flex items-center gap-3">
            <User size={20} /> <span className="text-sm font-medium capitalize">{role}</span>
          </div>
          <LogOut size={20} className="cursor-pointer" />
        </div>
      </div>
    </aside>
  );
}