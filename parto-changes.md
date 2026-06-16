# Parto — Changes Log

Daftar perubahan yang dilakukan selama sesi ini (belum di-push). Diurutkan per task.

---

## 1. (Admin) Tambah image saat membuat & mengedit tiket
Pembuatan tiket dengan gambar sudah ada via `CreateTicketFromChatModal`; yang dilengkapi adalah sisi **pengeditan**.
- `app/api/tickets/[id]/route.ts` — PATCH menerima `attachments` (gambar baru) & `removedAttachmentIds` (hapus), dijalankan dalam satu transaksi bersama update tiket.
- `app/api/tickets/route.ts` — GET list ikut mengembalikan `attachments` (id + url) agar modal tahu gambar existing.
- `components/EditTicketModal.tsx` — blok **Images**: tampilkan gambar existing, bisa hapus, tambah gambar baru (preview, maks 5), upload ke `/api/upload` saat save/approve.
- `app/admin/tickets/page.tsx` — tipe `TicketItem` membawa `attachments`.

## 2. (OPD) Fix bagian atas Kanban terlihat terpotong
Akar masalah: `-mt-2` pada root Kanban menarik sudut atas kolom ke luar batas clip `overflow-auto`.
- `components/spectrumui/kanbanboard.tsx` — hapus `-mt-2` (pill header tetap `rounded-sm` sesuai desain asli).
- `app/opd/tickets/page.tsx` — kontainer scroll diberi `pt-1` agar sudut atas tidak flush dengan garis clip.

## 3. (OPD) Sinkronisasi data Kanban / All Tickets / Aspirations dengan database
Sebelumnya perpindahan card Kanban hanya update state lokal + `console.log` (tidak persist).
- `app/api/opd/tickets/[id]/route.ts` — **endpoint baru** PATCH (role OPD, hanya tiket milik OPD-nya): update status + buat `TicketProgress` (from→to + note) + simpan `Attachment` bukti progress, dalam satu transaksi. Stamp `startDate`/`resolvedAt`/`closedAt` sesuai lifecycle.
- `components/spectrumui/kanbanboard.tsx` — fetch di-extract jadi `loadTickets`; `handleFinalProgressSave` kini optimistic move → upload `/api/upload` → PATCH → refetch saat gagal; map kolom→status.
- `components/UpdateProgressModal.tsx` — hapus toast "Task Updated" yang prematur + import `toast` yang tak terpakai.

## 4. (OPD) Dropdown Category di detail tiket tidak lagi terpotong
- `components/TaskDetail.tsx` — trigger Select Status/Category/Priority dari `w-[200px]` → `w-full` (mengisi sel grid), sehingga teks kategori panjang & panel dropdown lebih lega.

## 5. (OPD) Start date & Finish date berfungsi benar; "End Date" → "Finish Date"
- `types/task.ts` — tambah field `finishDate`.
- `app/opd/tickets/[id]/page.tsx` & `app/admin/tickets/[id]/page.tsx` — `finishDate` dipetakan dari `resolvedAt ?? closedAt`; admin meneruskan `apiBase="/api/tickets"`.
- `components/TaskDetail.tsx` — label "End Date" → "Finish Date"; state `finishDate` dari prop; **Save Changes kini persist** (upload bukti → PATCH `{apiBase}/[id]` → `router.refresh()`); prop `apiBase` agar OPD & Admin pakai endpoint yang benar; map status/priority → enum DB.
- `app/api/opd/tickets/[id]/route.ts` — endpoint OPD diperluas menerima `categoryId` & `urgency`.

### 5b. Recheck — beda tanggal antara tabel dan detail
Tabel masih pakai sumber lama (`createdAt`/`dueDate`), beda dari detail.
- `app/api/opd/tickets/route.ts` & `app/api/tickets/route.ts` — kembalikan `startDate` & `finishDate` (= `resolvedAt ?? closedAt`) sebagai string **date-only** (`YYYY-MM-DD`, sama seperti detail → bebas geser timezone); `createdAt` tetap dikirim untuk sort/filter.
- `app/opd/tickets/page.tsx` — kolom Finish Date → key `finishDate`; sort & range-filter fallback ke `createdAt`.
- `app/admin/tickets/page.tsx` — Start date → key `startDate`, Finish date → key `finishDate`; tipe `TicketItem` + `finishDate`.
- `lib/formatdate.ts` — `formatDate` dari `en-US` → `id-ID` agar format tanggal seragam dengan tabel.

## 6. (OPD) Pisahkan makna "Image" (dari user) vs "Gallery" (bukti progress OPD)
Sebelumnya `images` dan `gallery` diisi list attachment yang sama.
- `app/opd/tickets/[id]/page.tsx` & `app/admin/tickets/[id]/page.tsx` — split berdasarkan `uploadedById`: `null` → **Image** (dari user), terisi → **Gallery** (bukti progress OPD).
- `components/TaskDetail.tsx` — sync `task.gallery → galleryImages` agar bukti progress baru muncul setelah `router.refresh()`.

## 7. (Admin) Title card "OPD Performance"
- `app/admin/reports/page.tsx` — judul **"OPD Performance"** di pojok kiri atas card, sejajar (selevel) search box di kanan; responsif (menumpuk di layar kecil).

## 8. (Admin) Logika Average Response Time
Chart "Average Response Time" sebelumnya diisi data resolution-time (salah label).
- `app/api/reports/route.ts` — hitung response-time sejati: jeda dari pesan warga (`WARGA`) ke balasan staf pertama (`ADMIN`/`OPD`) dalam percakapan yang sama, di-bucket per hari kerja × 4 minggu, dirata-rata (jam). Scope: Admin = semua percakapan; OPD = percakapan tiket OPD tsb.

## 9. (Admin) Sort alphabetical di tabel Settings (CATEGORIES & NAME OPD)
- `components/TableTemplate.tsx` — dukungan sort per-kolom (opsional, backward-compatible): `sortable` pada kolom, props `sortConfig`/`onSort`, ikon arah (`ArrowUpDown`/`ArrowUp`/`ArrowDown`); export tipe `SortConfig`.
- `app/admin/settings/page.tsx` — state `sortConfig` + `handleSort` **3-siklus (asc → desc → default)**; urut via `localeCompare("id")`; kolom CATEGORIES & Organisasi Perangkat Daerah `sortable`; tabel render dari data terurut.

## 10. (Admin) Ketentuan format nomor HP
Best practice: simpan kanonik E.164 `+62…`, terima input fleksibel, normalisasi + validasi (frontend + backend).
- `lib/phone.ts` — **baru**: `normalizePhone()` (terima `0…`/`62…`/`+62…`, dengan/tanpa strip & spasi → `+6281234567890`) & `isValidPhone()`.
- `components/UserModal.tsx` — hapus live-mask buggy → input bebas; **perbaiki bug** field Phone modal Edit yang salah bind ke `addForm`; `handleAdd`/`handleEdit` normalisasi + validasi sebelum kirim.
- `app/api/users/route.ts` & `app/api/users/[id]/route.ts` — normalisasi + validasi server-side (tolak 400 bila format salah), simpan kanonik.

---

## Perubahan di luar 10 task

Perubahan berikut **ikut ter-staging** namun **bukan** bagian task 1–10 (sebagian sudah ada sebelum sesi / tidak terkait task). Didokumentasikan agar changelog jujur saat push.

### A. Proteksi rute berbasis role
- `middleware.ts` — `jwtVerify` kini membaca `role` dari payload; redirect berbasis path: akses `/admin/*` oleh non-ADMIN → `/opd/inbox`, akses `/opd/*` oleh non-OPD → `/admin/chat`. Matcher diperluas dari `'/dashboard/:path*'` menjadi `['/dashboard/:path*', '/admin/:path*', '/opd/:path*']`.

### B. Refactor layout tab Chat/Inbox
- `components/InteractionTabs.tsx` — tab mendukung `className` per-tab + props `containerClassName`/`tabClassName`; ukuran teks lebih responsif; label dibungkus `<span>`.
- `components/ListChat.tsx` — tab inbox diberi lebar (All/Unread `w-[20%]`, WhatsApp/Instagram `flex-1`) dalam container full-width; kontrol Sort/Status (`TimeRange`) dihapus; perapian format.
- `app/dashboard/Inbox/page.tsx` — baris kontrol Sort/Status (`TimeRange`) dihapus; perapian format (data chat masih dummy).

### C. Penyesuaian UI/layout
- `app/opd/layout.tsx` — background `<main>` dari `#F9F9F9` → `white`.
- `app/admin/user-management/page.tsx` & `app/dashboard/user-management/page.tsx` — `TableTemplate` diberi `containerClassName="h-full flex-1"`.
- `components/sidebar.tsx` — sebagian besar perapian indentasi; menghilangkan hover-background pada tombol logout.

### D. Detail tiket admin: dummy → database
- `app/admin/tickets/[id]/page.tsx` — file ditulis ulang dari berbasis **dummy** (`ticketsDummy`, `ReturnAdminButton`, gambar placeholder) menjadi berbasis **Prisma** (auth check, `findUnique`, map status/priority). Perubahan task #5 (`finishDate`, `apiBase`) dan #6 (split Image/Gallery via `uploadedById`) berada di atas penulisan ulang ini, sehingga diff file ini besar.

### E. Konfigurasi tooling (byproduct sesi)
- `.claude/settings.local.json` — penambahan allowlist perintah `npx eslint` yang dijalankan selama sesi (bukan perubahan aplikasi).

---

### Catatan
- `ProfileForm` / `/api/profile` (edit profil sendiri) **belum** ikut divalidasi dengan util nomor HP — opsional untuk konsistensi.
- Beberapa warning/error lint yang muncul saat pengerjaan bersifat **pre-existing** (mis. `no-explicit-any`, `react-hooks/set-state-in-effect`, komponen dibuat saat render di `UserModal`) dan bukan berasal dari perubahan sesi ini.
