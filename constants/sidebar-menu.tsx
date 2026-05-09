import { Inbox, Kanban, FileText, Ticket, MessageSquare, Share2, Users } from 'lucide-react';

export const SIDEBAR_MENU = {
  admin: [
    { name: 'Tickets', href: '/admin/dashboard/tickets', icon: <Ticket size={20} /> },
    { name: 'Reports', href: '/admin/dashboard/reports', icon: <FileText size={20} /> },
    { name: 'User Management', href: '/admin/dashboard/user-management', icon: <Users size={20} /> },
  ],
  opd: [
    { name: 'Inbox', href: '/opd/dashboard/inbox', icon: <Inbox size={20} /> },
    { name: 'Tickets', href: '/opd/dashboard/tickets', icon: <Ticket size={20} /> },
    { name: 'Reports', href: '/opd/dashboard/reports', icon: <FileText size={20} /> },
  ]
};