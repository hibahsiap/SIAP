import ListChat from "@/components/ListChat";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-2 grid grid-rows-1 grid-cols-[360px_1fr] 2xl:grid-cols-[400px_1fr] h-dvh overflow-hidden bg-white">
      {/* Panel Tengah: List Chat (Lebar tetap atau % ) */}
      <ListChat role="ADMIN"/>

      {/* Panel Kanan: Isi Chat (Flexible) */}
      <main className="h-full min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}