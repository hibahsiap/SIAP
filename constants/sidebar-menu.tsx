import { Inbox, Kanban, FileText, Ticket, MessageSquare, Share2, Users, FileChartColumn, UserRoundCog } from 'lucide-react';

export const SIDEBAR_MENU = {
  ADMIN: [
    { name: 'Tickets', href: '/admin/tickets', icon: <Ticket size={20} /> },
    { name: 'Reports', href: '/admin/reports', icon: <FileChartColumn size={20} /> },
    { name: 'User Management', href: '/admin/user-management', icon: <UserRoundCog size={20} /> },
  ],
  OPD: [
    { name: 'Inbox', href: '/opd/inbox', icon: <MessageSquare size={20} /> },
    { name: 'Tickets', href: '/opd/tickets', icon: <Ticket size={20} /> },
    { name: 'Reports', href: '/opd/reports', icon: <FileChartColumn size={20} /> },
  ]
};