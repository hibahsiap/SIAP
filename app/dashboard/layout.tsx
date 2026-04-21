import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 p-2 bg-[#F9F9F9]">
        {children}
      </main>
    </div>
  );
}