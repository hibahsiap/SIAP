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
import Login from "@/components/Login";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#f9f9f9] font-sans py-18 px-68">
      <Login/>
    </div>
  );
}