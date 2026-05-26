import React from "react";
// Sesuaikan path import ini dengan lokasi file ticketsDummy.tsx milikmu
import { pendingTickets, allTickets, aspirationTickets } from "@/constants/ticketsDummy";
import Link from "next/link";
// Sesuaikan path ini dengan lokasi komponen ReturnAdminButton milikmu
import ReturnAdminButton from "@/components/ReturnAdminButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminTicketDetailPage({ params }: Props) {
  const { id } = await params;
  
  // Gabungkan semua array tiket untuk mencari ID yang sesuai
  const allData = [...pendingTickets, ...allTickets, ...aspirationTickets];
  const ticket = allData.find((t) => t.id === Number(id));

  // Tampilan jika ID tiket tidak ada di dummy data
  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] p-8">
        <div className="w-full bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
          <i className="fa-regular fa-folder-open text-4xl text-slate-300 mb-4 block"></i>
          <p className="text-slate-600 font-medium">Tiket dengan ID {id} tidak ditemukan.</p>
          <Link href="/admin/tickets" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
            Kembali ke Daftar Tiket
          </Link>
        </div>
      </div>
    );
  }

  // Menyesuaikan field berdasarkan bentuk data dummy
  const title = "taskName" in ticket ? ticket.taskName : "Detail Aspirasi";
  const opdOrPengirim = "opd" in ticket ? ticket.opd : ticket.pengirim;
  const opdLabel = "opd" in ticket ? "OPD" : "Pengirim";
  const iconOpd = "opd" in ticket ? "fa-building" : "fa-user";

  // Ambil data gambar (bisa placeholder jika di dummy belum ada)
  const images = (ticket as any).images || [
    "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=400",
    "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=400",
    "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=400"
  ];
  const gallery = (ticket as any).gallery || [
    "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=800",
    "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=800",
    "https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=800"
  ];

  // Siapkan objek task untuk di-passing ke ReturnAdminButton
  const taskDataForButton = {
    ...ticket,
    id: String(ticket.id)
  };

  return (
    // DI SINI PERUBAHANNYA: flex dan justify-center dihapus
    <div className="min-h-screen bg-[#f8f9fa] p-4 lg:p-8">
      
      {/* DI SINI PERUBAHANNYA: max-w-5xl dihapus agar melebar full 100% */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-6 lg:p-10">
        
        {/* Header Dalam */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Link href="/admin/tickets" className="text-slate-400 hover:text-slate-800 transition">
              <i className="fa-solid fa-chevron-left text-xl"></i>
            </Link>
            <h2 className="text-2xl font-bold text-[#1D2F58]">{title}</h2>
          </div>
          
          <ReturnAdminButton task={taskDataForButton as any} />
        </div>

        {/* Detail Informasi */}
        <div className="space-y-6">
          
          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-start gap-4">
            <div className="flex items-center gap-2 text-slate-500 pt-0.5">
              <i className="fa-regular fa-id-badge w-5 text-center"></i>
              <span className="font-medium text-sm">ID Ticket</span>
            </div>
            <p className="text-slate-800 text-sm">{ticket.id}</p>
          </div>

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-start gap-4">
            <div className="flex items-center gap-2 text-slate-500 pt-0.5">
              <i className="fa-regular fa-clipboard w-5 text-center"></i>
              <span className="font-medium text-sm">Aspirasi</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed max-w-4xl text-justify">
              {ticket.message}
            </p>
          </div>

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-start gap-4">
            <div className="flex items-center gap-2 text-slate-500 pt-1">
              <i className="fa-regular fa-image w-5 text-center"></i>
              <span className="font-medium text-sm">Image</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {images.map((img: string, idx: number) => (
                <img key={idx} src={img} alt={`Bukti ${idx}`} className="w-28 h-28 object-cover rounded-lg border border-slate-200" />
              ))}
            </div>
          </div>

          <hr className="border-slate-100 my-8" />

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <i className="fa-solid fa-spinner w-5 text-center"></i>
              <span className="font-medium text-sm">Status</span>
            </div>
            <select 
              defaultValue={ticket.status} 
              className="w-full max-w-[280px] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1D2F58] focus:ring-1 focus:ring-[#1D2F58] bg-white cursor-pointer"
            >
              <option value="On Hold">On Hold</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {"issueType" in ticket && (
            <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <i className="fa-regular fa-circle-dot w-5 text-center"></i>
                <span className="font-medium text-sm">Issue Type</span>
              </div>
              <select 
                defaultValue={ticket.issueType} 
                className="w-full max-w-[280px] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1D2F58] focus:ring-1 focus:ring-[#1D2F58] bg-white cursor-pointer"
              >
                <option value="Health">Health</option>
                <option value="Social">Social</option>
                <option value="Traffic">Traffic</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <i className={`fa-regular ${iconOpd} w-5 text-center`}></i>
              <span className="font-medium text-sm">{opdLabel}</span>
            </div>
            <p className="text-slate-800 text-sm">{opdOrPengirim}</p>
          </div>

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <i className="fa-regular fa-flag w-5 text-center"></i>
              <span className="font-medium text-sm">Priority</span>
            </div>
            <select 
              defaultValue={ticket.priority} 
              className="w-full max-w-[280px] border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1D2F58] focus:ring-1 focus:ring-[#1D2F58] bg-white cursor-pointer"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <i className="fa-regular fa-calendar-days w-5 text-center"></i>
              <span className="font-medium text-sm">Start Date</span>
            </div>
            <p className="text-slate-800 text-sm">
              {"startDate" in ticket ? (ticket.startDate as string) : "March 1, 2026"}
            </p>
          </div>

          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <i className="fa-regular fa-calendar-check w-5 text-center"></i>
              <span className="font-medium text-sm">End Date</span>
            </div>
            <p className="text-slate-800 text-sm">
              {"dueDate" in ticket ? (ticket.dueDate as string) : "-"}
            </p>
          </div>

        </div>

        {/* Section Gallery Bawah */}
        <div className="mt-14">
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-slate-700 font-semibold bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
              <i className="fa-solid fa-border-all"></i> Gallery
            </div>
            <button className="px-5 py-2.5 bg-[#041942] text-white font-semibold rounded-lg text-sm hover:bg-[#03102a] transition flex items-center gap-2 shadow-sm">
              <i className="fa-solid fa-plus"></i> ADD IMAGE
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((img: string, idx: number) => (
              <img key={idx} src={img} alt={`Gallery ${idx}`} className="w-full h-56 object-cover rounded-xl border border-slate-200" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}