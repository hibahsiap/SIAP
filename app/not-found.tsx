"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleBackToDashboard = () => {
    // Pengaman agar localStorage hanya dieksekusi di sisi client (browser)
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");

      if (role === "ADMIN") {
        router.push("/admin/chat");
        return;
      } 
      
      if (role === "OPD") {
        router.push("/opd/inbox");
        return;
      }
    }

    // Fallback jika role tidak cocok atau belum login
    router.push("/");
  };

  return (
    // Menggunakan grid/flex standar tanpa 'absolute' agar responsive layout terjaga aman di semua ukuran layar
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#1a233a] to-white p-6">
      
      {/* Container Konten Utama */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl w-full">

        {/* Gambar Dino */}
        <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] shrink-0">
          <Image
            src="/images/404-Character.png"
            alt="Dino 404"
            fill
            sizes="(max-width: 768px) 280px, (max-width: 1024px) 450px, 500px"
            className="object-contain"
            priority
          />
        </div>

        {/* Teks Informasi */}
        <div className="max-w-md text-center md:text-left flex flex-col items-center md:items-start">
          <h2 className="text-3xl md:text-4xl font-bold text-[#041942] mb-4 leading-tight">
            Whoops! Looks Like This Page Went on Vacation!
          </h2>
          <p className="text-gray-600 mb-8 text-sm md:text-base leading-relaxed">
            Uh oh! Our little cartoon friends might have accidentally scribbled
            out this address. We can't seem to find the page you're looking for.
          </p>

          <Button
            onClick={handleBackToDashboard}
            className="bg-[#041942] hover:bg-[#1a233a] text-white px-8 py-6 rounded-lg text-base font-semibold shadow-md active:scale-98 transition-all w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
}