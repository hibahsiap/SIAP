'use client';

import { SIDEBAR_MENU } from '@/constants/sidebar-menu';
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  MessageSquare,
  MessageSquareMore,
  MessagesSquare,
  Settings,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar({
  role,
  name,
}: {
  role: 'ADMIN' | 'OPD';
  name?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = SIDEBAR_MENU[role];

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch {
      // ignore
    }

    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    const isInboxRoute =
      pathname.includes('/admin/chat') ||
      pathname.includes('/admin/comments');

    if (isInboxRoute) {
      setIsSubMenuOpen(true);
    } else {
      setIsSubMenuOpen(false);
    }
  }, [pathname]);

  const getLinkStyle = (href: string) => {
    const isActive = pathname === href;
    const baseClass =
      'flex items-center gap-3 px-4 py-3 rounded-[4px] transition-all duration-200 group mb-1 text-sm font-medium';

    return isActive
      ? `${baseClass} bg-[#E2EFF3]/10 text-white border-r-4 border-white`
      : `${baseClass} text-slate-400 hover:bg-[#E2EFF3]/10 hover:text-white`;
  };

  const getLinkProfileStyle = (href: string) => {
    const isActive = pathname === href;
    const baseClass =
      'flex items-center justify-between gap-3 px-4 py-3 rounded-[4px] transition-all duration-200 group mb-1 text-sm font-medium';

    return isActive
      ? `${baseClass} bg-[#E2EFF3]/10 text-white border-r-4 border-white`
      : `${baseClass} text-slate-400 hover:bg-[#E2EFF3]/10 hover:text-white`;
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#1D2F58] text-white flex flex-col px-2 pb-4 pt-6 border-r border-slate-700">
      {/* Logo & Branding */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg p-1.5 shadow-md">
          <Image
            src="/logo_siap.png"
            alt="Logo SIAP"
            width={38}
            height={38}
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-1">
          <h1 className="font-bold text-[16px] leading-tight">SIAP</h1>
          <p className="text-[9px] uppercase text-slate-400 tracking-wider">
            Sistem Informasi Aduan Publik
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {/* Inbox dengan Submenu */}
        {role === 'ADMIN' && (
          <div className="space-y-1">
            <div
              onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
              className={`flex items-center justify-between px-4 py-3 rounded-[4px] cursor-pointer transition-all ${pathname.includes('/admin/chat') ||
                pathname.includes('/admin/comments')
                ? 'text-white'
                : 'text-slate-400 hover:bg-[#E2EFF3]/10 hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={20} />
                <span className="font-medium text-sm">Inbox</span>
              </div>

              {isSubMenuOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>

            {/* Submenu Chat & Comments */}
            {isSubMenuOpen && (
              <div className="pl-1 space-y-1 border-l ml-6 border-slate-600 transition-all">
                <Link
                  href="/admin/chat"
                  className={getLinkStyle('/admin/chat')}
                >
                  <MessagesSquare size={16} />
                  Chat
                </Link>

                <Link
                  href="/admin/comments"
                  className={getLinkStyle('/admin/comments')}
                >
                  <MessageSquareMore size={16} />
                  Comments
                </Link>
              </div>
            )}
          </div>
        )}

        {menuItems.map((item) => (
          <Link
            href={item.href}
            key={item.name}
            className={getLinkStyle(item.href)}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-700 pt-4 space-y-1">
        {role === 'ADMIN' ? (
          <>
            <Link
              href="/admin/settings"
              className={getLinkStyle('/admin/settings')}
            >
              <Settings size={20} />
              <span className="text-sm">Settings</span>
            </Link>

            <div className={getLinkProfileStyle('/admin/profile')}>
              <Link
                href="/admin/profile"
                className="w-full flex items-center gap-3 min-w-0"
              >
                <User size={20} />
                <span className="text-sm truncate">
                  {name ?? 'Admin'}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="hover:bg-[#E2EFF3]/50 p-0.5 rounded-[4px] transition-all transform duration-300 cursor-pointer"
              >
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className={getLinkProfileStyle('/opd/profile')}>
            <Link
              href="/opd/profile"
              className="w-full flex items-center gap-3 min-w-0"
            >
              <User size={20} />
              <span className="text-sm truncate">
                {name ?? 'OPD'}
              </span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="hover:bg-[#E2EFF3]/50 p-0.5 rounded-[4px] transition-all transform duration-300 cursor-pointer"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}