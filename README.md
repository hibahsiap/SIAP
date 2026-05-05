SIAP --- Sistem Informasi Aspirasi Publik
=======================================

Frontend dashboard untuk pengelolaan aspirasi publik, tiket pengaduan, laporan, dan monitoring media sosial. Sistem ini digunakan untuk mendukung koordinasi antara Admin dan OPD (Organisasi Perangkat Daerah) dalam menangani aspirasi masyarakat secara terstruktur.

* * * * *

Deskripsi Proyek
----------------

SIAP merupakan aplikasi web berbasis dashboard yang berfungsi sebagai pusat pengelolaan aspirasi publik dari berbagai kanal. Sistem ini dirancang untuk:

-   menerima dan memantau aspirasi masyarakat,

-   mengelola tiket pengaduan,

-   menyajikan laporan dan analisis data,

-   mendukung koordinasi tindak lanjut antara Admin dan OPD.

Aplikasi memiliki dua peran utama:

### Admin

Berfokus pada pengelolaan data, pengguna, tiket, serta monitoring media sosial.

### OPD

Berfokus pada tindak lanjut aspirasi publik dan pengelolaan tugas operasional.

* * * * *

Fitur Utama
-----------

### Admin

-   Inbox aspirasi dan komunikasi masuk

-   Laporan dan analisis data

-   Manajemen pengguna dan hak akses

-   Pengelolaan tiket pengaduan

-   Monitoring media sosial

### OPD

-   Inbox aspirasi sesuai bidang terkait

-   Kanban untuk manajemen tugas

-   Laporan progres dan kinerja

-   Tindak lanjut tiket pengaduan

-   Daftar aspirasi publik yang ditangani

### Komponen Sistem

-   Dashboard interaktif dengan visualisasi data

-   Tabel data, pencarian, paginasi, dan modal

-   Sistem notifikasi

-   Dukungan tema light dan dark mode

* * * * *

Tech Stack
------------------------

| Kategori | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript 5 |
| UI Library | React 19, shadcn/ui, Radix UI |
| Styling | Tailwind CSS 4 |
| State Management | Zustand |
| Visualisasi Data | Recharts |
| Animasi | Framer Motion |
| Ikon | Lucide React, React Icons |
| Notifikasi | Sonner |
| Linting | ESLint 9 |

* * * * *

Instalasi
---------

### Prasyarat

-   Node.js versi 18.18 atau lebih baru

-   npm, yarn, pnpm, atau bun

### Clone Repository

```
git clone https://github.com/hibahsiap/SIAP.git
cd SIAP

```

### Install Dependencies

```
npm install

```

### Menjalankan Development Server

```
npm run dev

```

Aplikasi akan berjalan pada:

```
http://localhost:3000

```

dan otomatis mengarahkan pengguna ke halaman login.

### Build Production

```
npm run build
npm run start

```

### Linting

```
npm run lint

```

* * * * *

Script yang Tersedia
--------------------

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build aplikasi production |
| `npm run start` | Menjalankan production server |
| `npm run lint` | Menjalankan proses linting |

* * * * *

Lisensi
-------

Proyek ini bersifat privat dan digunakan untuk kebutuhan internal. Penggunaan lebih lanjut memerlukan izin dari pemilik repository.
