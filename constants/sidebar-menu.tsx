import { Inbox, Kanban, FileText, Ticket, MessageSquare, Share2, Users, FileChartColumn, UserRoundCog } from 'lucide-react';

export const SIDEBAR_MENU = {
  admin: [
    { name: 'Tickets', href: '/admin/dashboard/tickets', icon: <Ticket size={20} /> },
    { name: 'Reports', href: '/admin/dashboard/reports', icon: <FileChartColumn size={20} /> },
    { name: 'User Management', href: '/admin/dashboard/user-management', icon: <UserRoundCog size={20} /> },
  ],
  opd: [
    { name: 'Inbox', href: '/opd/dashboard/inbox', icon: <MessageSquare size={20} /> },
    { name: 'Tickets', href: '/opd/dashboard/tickets', icon: <Ticket size={20} /> },
    { name: 'Reports', href: '/opd/dashboard/reports', icon: <FileChartColumn size={20} /> },
  ]
};