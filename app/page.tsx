// app/page.tsx
import Sidebar from "@/components/sidebar";

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <div className="p-10">
        <h1>Dashboard Utama</h1>
      </div>
    </main>
  );
}