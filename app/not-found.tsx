"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleBackToDashboard = () => {
    const role = localStorage.getItem("userRole");

    if (role === "ADMIN") {
      router.push("/admin/chat");
    } else if (role === "OPD") {
      router.push("/opd/inbox");
    } else {
      // Fallback jika role tidak ditemukan (belum login)
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1a233a] to-white p-6 text-center">

      {/* Container Konten Utama */}
      <div className="absolute flex flex-col md:flex-row items-center justify-center gap-8">

        {/* Gambar Dino */}
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
          <Image
            src="/images/404-Character.png"
            alt="Dino 404"
            fill
            sizes="(max-width: 768px) 300px, 500px"
            className="object-contain"
            priority
          />
        </div>

        {/* Teks Informasi */}
        <div className="max-w-md text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-[#041942] mb-4">
            Whoops! Looks Like This Page Went on Vacation!
          </h2>
          <p className="text-gray-600 mb-8">
            Uh oh! Our little cartoon friends might have accidentally scribbled
            out this address. We can't seem to find the page you're looking for.
          </p>

          <Button
            onClick={handleBackToDashboard}
            className="bg-[#041942] hover:bg-[#1a233a] text-white px-8 py-6 rounded-lg text-lg"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
