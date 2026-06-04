# AGENTS.md

# SIAP

SIAP adalah sistem layanan dan monitoring aduan masyarakat terintegrasi berbasis web.

Tujuan sistem:

- Sentralisasi aduan masyarakat
- Klasifikasi aduan otomatis menggunakan LLM
- Distribusi aduan ke OPD terkait
- Monitoring progres penyelesaian
- Transparansi status penanganan

---

# Supported Platforms

Saat ini sistem menerima data dari:

- WhatsApp
- Instagram DM
- Instagram Comment

Planned / Hold:

- Facebook Messenger
- X (Twitter) DM

Agent harus mempertimbangkan bahwa platform yang masih berstatus Hold belum menjadi prioritas implementasi.

---

# Technology Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- NestJS
- TypeScript

Database:
- PostgreSQL
- Prisma ORM

Authentication:
- JWT
- Session

---

# Local Development

Frontend:
http://localhost:3000

Backend:
http://localhost:3001

---

# Core Domain

SIAP memiliki tiga jenis layanan:

1. Aduan
2. Aspirasi
3. Permintaan Informasi

Ketiga jenis layanan memiliki alur bisnis yang berbeda.

---

# Aduan Flow

Input:

- WhatsApp
- Instagram DM

Flow:

1. Pesan masuk
2. Auto reply command
3. User memilih jenis layanan
4. User mengirim template aduan
5. LLM validasi kelengkapan
6. LLM klasifikasi aduan
7. Admin verifikasi hasil klasifikasi
8. Sistem membuat ticket
9. Sistem routing ke OPD
10. OPD melakukan progres penanganan
11. User dapat melacak progres menggunakan nomor tiket

---

# Aspirasi Flow

Input:

- WhatsApp
- Instagram DM
- Komentar media sosial yang dipilih admin

Flow:

1. Aspirasi diterima
2. Dicatat dalam sistem
3. Admin menentukan OPD tujuan
4. Aspirasi ditampilkan dalam bentuk tabel monitoring

Aspirasi tidak menggunakan room chat.

---

# Pertanyaan Flow

Input:

- WhatsApp
- Instagram DM

Flow:

1. Pertanyaan diterima
2. Dibuat room chat
3. OPD menyiapkan jawaban
4. Admin melakukan review
5. Jawaban dikirim ke masyarakat

Pertanyaan menggunakan room chat.

---

# Social Media Comment Flow

Komentar media sosial tidak otomatis menjadi tiket.

Flow:

1. Sistem mengambil komentar
2. Admin meninjau komentar
3. Admin menentukan apakah komentar perlu dibuat tiket
4. Jika ya, tiket dibuat secara manual

---

# LLM Responsibilities

LLM digunakan untuk:

1. Validasi kelengkapan aduan
2. Klasifikasi aduan
3. Menentukan kategori
4. Menentukan OPD tujuan
5. Menghasilkan output JSON terstruktur

LLM tidak boleh menjadi sumber kebenaran final.

Admin selalu dapat mengubah hasil klasifikasi.

---

# Ticketing Rules

Ticket hanya dibuat setelah:

- Hasil klasifikasi diverifikasi admin

atau

- Admin membuat tiket dari komentar media sosial

---

# Tracking Rules

Masyarakat dapat melacak:

- Status tiket
- Riwayat progres

Data tracking berasal dari progres OPD.

---

# Progress Rules

Setiap progres OPD wajib memiliki:

- Deskripsi progres
- Bukti foto

---

# Important Constraints

Tidak ada kewajiban masyarakat mengunggah lampiran saat membuat aduan.

Sistem harus tetap menerima aduan tanpa foto atau dokumen pendukung.

---

# Architecture Rules

Frontend tidak boleh berisi business logic utama.

Business logic berada di backend NestJS.

Routing dan klasifikasi dilakukan di backend.

---

# Development Rules

Sebelum membuat fitur baru:

1. Cari implementasi yang sudah ada.
2. Reuse service yang tersedia.
3. Hindari duplicate logic.
4. Jangan mengubah API contract tanpa alasan kuat.
5. Jangan mengubah database schema tanpa migration.

---

# Existing Project Conventions

Backend port:
- 3001

Admin CRUD:
- menggunakan id

Public access:
- menggunakan slug bila tersedia

---

# OpenSpec Maintenance

Jika fitur berubah:

Update:

- .openspec/project.md
- .openspec/features.md
- .openspec/api.md
- .openspec/database.md
- .openspec/roadmap.md