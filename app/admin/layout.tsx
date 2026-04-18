import Sidebar from "@/components/ui/layout/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Panggil komponen sidebar di sebelah kiri */}
      <Sidebar />
      
      {/* Area konten di sebelah kanan */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}