import { Mail, Lock, Phone } from "lucide-react";

const activities = [
  { icon: Mail, title: "Primary Email Changed", time: "12:03PM", date: "09-11-2023", desc: "Updated by Admin", detail: "Change: old***@mail.com → new***@mail.com" },
  { icon: Lock, title: "Password Updated", time: "12:03PM", date: "09-11-2023", desc: "Password changed by User via ...", detail: "Status: Successfully updated" },
  { icon: Phone, title: "Phone Number Verified", time: "12:03PM", date: "09-11-2023", desc: "Added by User via SMS OTP", detail: "Device: iPhone 18 Pro" },
];

export function ActivityLog() {
  return (
    <div className="relative pt-0">
      
      <div className="absolute left-[117px] top-[10px] bottom-[20px] w-[2px] bg-gray-300 z-0"></div>

      <div className="space-y-8 relative z-10">
        {activities.map((act, i) => {
          const Icon = act.icon;
          return (
            <div key={i} className="flex gap-2">
              {/* Kolom Waktu: Dibuat fixed-width agar rapi */}
              <div className="text-right w-[80px] shrink-0">
                <p className="text-[10px] font-bold text-gray-500">{act.time}</p>
                <p className="text-[12px] font-bold text-gray-900">{act.date}</p>
                <p className="text-[8px] text-gray-400 mt-1 leading-tight">Cr 10 83 A 52 Of 104<br/>Bogotá, Colombia</p>
              </div>

              {/* Kolom Ikon*/}
              <div className="w-[60px] flex justify-center pt-1">
                <div className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-gray-700 shadow-md">
                  <Icon size={20} />
                </div>
              </div>

              {/* Kolom Konten */}
              <div className="flex-1 pt-4">
                <p className="text-[13px] font-bold text-gray-900">{act.title}</p>
                <p className="text-[12px] text-gray-500">{act.desc}</p>
                <p className="text-[12px] text-gray-500 font-medium">{act.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}