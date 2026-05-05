```markdown
<div align="center">
  <img src="https://placehold.co/150x150/4f46e5/ffffff?text=Logo+SIAP" alt="SIAP Logo" width="120" style="border-radius: 20px;" />

  # SIAP - Sistem Informasi Aspirasi Publik
  **Frontend dashboard untuk pengelolaan aspirasi publik, tiket pengaduan, laporan, dan monitoring media sosial.**

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  
  Sistem ini digunakan untuk mendukung koordinasi antara **Admin** dan **OPD** (Organisasi Perangkat Daerah) dalam menangani aspirasi masyarakat secara terstruktur.
</div>

---

![Dashboard Preview](https://placehold.co/1000x450/f3f4f6/1f2937?text=🖼️+Masukkan+Screenshot+Dashboard+Utama+Di+Sini)

## Deskripsi Proyek

**SIAP** merupakan aplikasi web berbasis dashboard yang berfungsi sebagai pusat pengelolaan aspirasi publik dari berbagai kanal. Sistem ini dirancang untuk:

- **Menerima dan memantau** aspirasi masyarakat.
- **Mengelola tiket** pengaduan secara terpusat.
- **Menyajikan laporan** dan analisis data yang komprehensif.
- **Mendukung koordinasi** tindak lanjut antara Admin dan OPD.

---

## Feature List

Aplikasi ini memiliki dua peran utama dengan pembagian fokus yang jelas:

### Admin
Berfokus pada pengelolaan data, pengguna, tiket, serta monitoring media sosial.

![Admin View](https://placehold.co/800x350/e0e7ff/3730a3?text=🖼️+Screenshot+Halaman+Admin)

- **Inbox Aspirasi:** Mengelola komunikasi dan pesan masuk.
- **Laporan & Analisis Data:** Visualisasi data pengaduan.
- **Manajemen Pengguna:** Pengaturan hak akses (Role-Based Access).
- **Pengelolaan Tiket:** Tracking status pengaduan.
- **Monitoring Medsos:** Memantau tren dan isu di media sosial.

### OPD (Organisasi Perangkat Daerah)
Berfokus pada tindak lanjut aspirasi publik dan pengelolaan tugas operasional.

![OPD View](https://placehold.co/800x350/dcfce7/166534?text=🖼️+Screenshot+Halaman+OPD)

- **Inbox Khusus Bidang:** Aspirasi yang sudah disaring sesuai tupoksi.
- **Kanban Board:** Manajemen tugas yang interaktif.
- **Laporan Kinerja:** Memantau progres penyelesaian tiket.
- **Tindak Lanjut:** Fitur update status tiket pengaduan.

### Komponen Sistem Interaktif
- **Dashboard** dengan visualisasi data interaktif (Recharts).
- **Tabel Data** dilengkapi pencarian, paginasi, dan modal.
- **Sistem Notifikasi** *real-time*.
- **Tema UI:** Mendukung *Light Mode* dan *Dark Mode*.

---

## Tech Stack

Sistem ini dibangun menggunakan teknologi modern untuk memastikan performa yang cepat dan pengalaman pengguna yang optimal.

| Kategori | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Bahasa** | TypeScript 5 |
| **UI Library** | React 19, shadcn/ui, Radix UI |
| **Styling** | Tailwind CSS 4 |
| **State Management** | Zustand |
| **Visualisasi Data** | Recharts |
| **Animasi** | Framer Motion |
| **Ikon** | Lucide React, React Icons |
| **Notifikasi** | Sonner |
| **Linting** | ESLint 9 |

---

## Instalasi Project

### Prasyarat
Pastikan sistem Anda telah menginstal:
- **Node.js** (Versi 18.18 atau lebih baru)
- Package manager: `npm`, `yarn`, `pnpm`, atau `bun`

### Langkah-langkah

1. **Clone Repository**
   ```bash
   git clone [https://github.com/hibahsiap/SIAP.git](https://github.com/hibahsiap/SIAP.git)
   cd SIAP
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Menjalankan Development Server**
   ```bash
   npm run dev
   ```
   > Aplikasi akan berjalan pada `http://localhost:3000` dan otomatis mengarahkan pengguna ke halaman login.

4. **Build Production**
   ```bash
   npm run build
   npm run start
   ```

---

## Command List

Berikut adalah perintah singkat yang dapat digunakan melalui terminal:

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan *development server* |
| `npm run build` | Build aplikasi untuk *production* |
| `npm run start` | Menjalankan *production server* |
| `npm run lint` | Menjalankan proses *linting* kode |

---

## Lisensi

Proyek ini bersifat **privat** dan digunakan khusus untuk kebutuhan internal. Penggunaan, penyalinan, atau modifikasi lebih lanjut memerlukan izin resmi dari pemilik repository.
```
