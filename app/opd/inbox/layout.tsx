import ListChat from "@/components/ListChat";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-2 flex h-screen overflow-hidden bg-white">
      {/* Panel Tengah: List Chat (Lebar tetap atau % ) */}
      <ListChat role="OPD"/>

      {/* Panel Kanan: Isi Chat (Flexible) */}
      <main className="flex-1 h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
}