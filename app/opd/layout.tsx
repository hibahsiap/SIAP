import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar role="opd"/>
      <main className="flex-1 bg-[#F9F9F9]">
        {children}
      </main>
    </div>
  );
}