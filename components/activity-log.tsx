"use client";

import {
  Mail,
  Lock,
  Phone,
  User,
  FileText,
  LogIn,
  LogOut,
  AlertCircle,
  Building2,
  IdCard,
} from "lucide-react";
import { ProfileStore } from "@/components/ProfileStore";
import { formatTime, formatDate } from "@/lib/formatdate";

function iconForAction(action: string) {
  if (action.includes('PASSWORD')) return Lock;
  if (action.includes('EMAIL')) return Mail;
  if (action.includes('PHONE')) return Phone;
  if (action.includes('NAME')) return IdCard;
  if (action.includes('OPD')) return Building2;
  if (action.includes('LOGIN')) return LogIn;
  if (action.includes('LOGOUT')) return LogOut;
  if (action.includes('PROFILE')) return User;
  if (action.includes('TICKET')) return FileText;
  return AlertCircle;
}

function humanizeAction(action: string) {
  return action
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function ActivityLog() {
  const { logs, loaded } = ProfileStore();

  if (!loaded) {
    return <p className="text-[12px] text-gray-400">Loading activity…</p>;
  }

  if (logs.length === 0) {
    return <p className="text-[12px] text-gray-400">No activity yet.</p>;
  }

  return (
    <div className="relative pt-0">
      <div className="absolute left-[117px] top-[10px] bottom-[20px] w-[2px] bg-gray-300 z-0"></div>

      <div className="space-y-8 relative z-10">
        {logs.map((log) => {
          const Icon = iconForAction(log.action);
          const time = formatTime(log.createdAt);
          const date = formatDate(log.createdAt);
          return (
            <div key={log.id} className="flex gap-2">
              <div className="text-right w-[80px] shrink-0">
                <p className="text-[10px] font-bold text-gray-500">{time}</p>
                <p className="text-[12px] font-bold text-gray-900">{date}</p>
              </div>

              <div className="w-[60px] flex justify-center pt-1">
                <div className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-700 shadow-md">
                  <Icon size={20} />
                </div>
              </div>

              <div className="flex-1 pt-4">
                <p className="text-[13px] font-bold text-gray-900">{humanizeAction(log.action)}</p>
                {log.description && (
                  <p className="text-[12px] text-gray-500">{log.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
