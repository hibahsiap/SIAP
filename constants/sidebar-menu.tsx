import { Inbox, Kanban, FileText, Ticket, MessageSquare, Share2, Users } from 'lucide-react';

export const SIDEBAR_MENU = {
  admin: [
    { name: 'Inbox', href: '/admin/inbox', icon: <Inbox size={20} /> },
    { name: 'Reports', href: '/admin/reports', icon: <FileText size={20} /> },
    { name: 'User Management', href: '/admin/usermanagement', icon: <Users size={20} /> },
    { name: 'Tickets', href: '/admin/tickets', icon: <Ticket size={20} /> },
    { name: 'Social Media', href: '/admin/social-media', icon: <Share2 size={20} /> },
  ],
  opd: [
    { name: 'Inbox', href: '/opd/inbox', icon: <Inbox size={20} /> },
    { name: 'Kanban', href: '/opd/kanban', icon: <Kanban size={20} /> },
    { name: 'Reports', href: '/opd/reports', icon: <FileText size={20} /> },
    { name: 'Tickets', href: '/opd/tickets', icon: <Ticket size={20} /> },
    { name: 'Public Aspirations', href: '/opd/aspirations', icon: <MessageSquare size={20} /> },
  ]
};