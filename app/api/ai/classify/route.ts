import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content)
    return NextResponse.json({ error: "content is required" }, { status: 400 });

  const dbCategories = await prisma.category.findMany({ select: { name: true } });
  const categoryList = dbCategories.length > 0
    ? dbCategories.map((c: { name: string }) => c.name).join(", ")
    : "Jalan dan Infrastruktur, Sampah dan Kebersihan, Banjir dan Bencana, Pendidikan, Kesehatan, Kependudukan, Bantuan Sosial, Transportasi, Teknologi dan Internet, Perdagangan dan UMKM";

  const systemPrompt = `Kamu adalah asisten klasifikasi pengaduan publik untuk pemerintah daerah Indonesia.
Tugasmu: analisis pesan warga dan kembalikan klasifikasi dalam format JSON.

=== ATURAN TYPE ===
- COMPLAINT: keluhan, laporan masalah, pengaduan
- QUESTION: pertanyaan, permintaan informasi atau prosedur
- FEEDBACK: saran, masukan, apresiasi

=== ATURAN URGENCY ===
- CRITICAL: mengancam keselamatan jiwa, bencana aktif, darurat
- HIGH: masalah serius yang mengganggu banyak orang atau perlu ditangani segera
- MEDIUM: masalah umum yang perlu ditangani dalam waktu normal
- LOW: pertanyaan, saran ringan, informasi

=== KATEGORI YANG TERSEDIA ===
Pilih SATU nama kategori yang PALING SESUAI dari daftar berikut. Jangan mengarang nama kategori baru.
WAJIB diisi — selalu pilih yang paling mendekati, jangan pernah null.

${categoryList}

Panduan pemilihan kategori:
- Jalan berlubang, drainase, jembatan, trotoar → "Jalan dan Infrastruktur"
- Sampah, kebersihan lingkungan, TPS → "Sampah dan Kebersihan"
- Banjir, longsor, gempa, bencana alam → "Banjir dan Bencana"
- Sekolah, guru, kurikulum, beasiswa → "Pendidikan"
- Puskesmas, rumah sakit, obat, vaksin → "Kesehatan"
- KTP, KK, akta, dukcapil, dokumen kependudukan → "Kependudukan"
- Bansos, PKH, sembako, BPNT, subsidi → "Bantuan Sosial"
- Angkutan umum, parkir, kemacetan, terminal → "Transportasi"
- Internet, wifi, aplikasi pemerintah, TIK → "Teknologi dan Internet"
- Pasar, UMKM, izin usaha, PKL → "Perdagangan dan UMKM"

=== FORMAT OUTPUT ===
Kembalikan HANYA objek JSON valid, tanpa markdown, tanpa komentar, tanpa teks lain:
{"title":"judul singkat maksimal 80 karakter","description":"ringkasan 1-2 kalimat isi pesan","type":"COMPLAINT|FEEDBACK|QUESTION","urgency":"LOW|MEDIUM|HIGH|CRITICAL","location":"nama lokasi jika disebutkan, atau null","category":"nama kategori persis seperti di daftar (WAJIB diisi)"}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Pesan warga: ${content}` },
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json({
      title: result.title ?? null,
      description: result.description ?? null,
      type: result.type ?? null,
      urgency: result.urgency ?? null,
      location: result.location ?? null,
      category: result.category ?? null,
    });
  } catch (err) {
    console.error("[AI Classify] Error:", err);
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}
