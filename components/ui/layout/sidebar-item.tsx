import Link from 'next/link';

interface ItemProps {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
}

export function SidebarItem({ name, href, icon, isActive }: ItemProps) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive ? 'bg-slate-700/80 text-white shadow-lg' : 'hover:bg-slate-700/50 text-slate-300'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{name}</span>
    </Link>
  );
}