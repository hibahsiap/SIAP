# Flow Demonstrasi SIAP (Sistem Layanan dan Monitoring Aduan Masyarakat Terintegrasi)

Dokumen ini berisi panduan *end-to-end* untuk mendemonstrasikan sistem SIAP secara profesional, mencakup seluruh alur bisnis utama dari sisi masyarakat, admin, dan OPD.

---

## Persiapan Sebelum Demonstrasi
- Pastikan Frontend (`localhost:3000`) dan Backend (`localhost:3001`) sudah berjalan.
- Siapkan perangkat seluler (WhatsApp/Instagram) atau emulator untuk simulasi *user*.
- Siapkan akun login untuk *Role Admin* dan *Role OPD*.
- Siapkan beberapa file gambar dummy untuk mendemonstrasikan fitur unggah bukti foto.

---

## Sesi 1: Pendahuluan (1-2 Menit)
**Tujuan:** Memberikan gambaran besar mengenai masalah yang dipecahkan dan solusi yang ditawarkan SIAP.

1. **Buka Halaman Utama (Frontend):** Tampilkan halaman *landing page* SIAP kepada audiens.
2. **Jelaskan Tujuan Sistem:** Sebutkan bahwa SIAP mensentralisasi aduan dari berbagai channel (WhatsApp, Instagram) menjadi satu pintu.
3. **Sebutkan 3 Layanan Utama:** Jelaskan secara singkat bahwa sistem ini menangani: **Aduan**, **Aspirasi**, dan **Permintaan Informasi**, masing-masing dengan alur yang berbeda.

---

## Sesi 2: Demonstrasi Flow Aduan (Integrasi AI) (4-5 Menit)
**Tujuan:** Memperlihatkan bagaimana sistem menerima aduan, peran AI (LLM) dalam klasifikasi, hingga verifikasi admin.

1. **Kirim Pesan Sapaan (Sisi Masyarakat):** 
   - *Aksi:* Kirim pesan (misal: "Halo") ke bot WhatsApp/IG SIAP.
   - *Penjelasan:* Tunjukkan *auto-reply* command dari sistem yang meminta *user* memilih layanan.
2. **Pilih Layanan & Isi Template (Sisi Masyarakat):**
   - *Aksi:* Pilih menu "Aduan". Sistem membalas dengan template. Balas pesan dengan mengisi template (Contoh: "Jalan berlubang parah di Jalan Merdeka, mohon perbaikan").
   - *Penjelasan:* Tekankan bahwa masyarakat **tidak wajib** melampirkan foto pada tahap ini untuk memudahkan pelaporan.
3. **Proses AI / LLM (Di Balik Layar):**
   - *Penjelasan:* Ceritakan kepada audiens bahwa saat pesan masuk, AI (LLM) sedang bekerja memvalidasi kelengkapan, mengklasifikasikan jenis aduan, dan menyarankan OPD tujuan.
4. **Verifikasi Klasifikasi (Sisi Admin):**
   - *Aksi:* Login ke Dashboard Admin. Buka daftar aduan baru. 
   - *Penjelasan:* Perlihatkan hasil klasifikasi dan saran OPD dari LLM. Tekankan bahwa **Admin selalu memiliki kontrol penuh** (menyetujui atau mengedit hasil AI).
5. **Pembuatan Tiket (Sisi Admin):**
   - *Aksi:* Klik *Approve/Verifikasi*.
   - *Penjelasan:* Tunjukkan bahwa tiket resmi kini telah dibuat dengan nomor tiket unik dan otomatis diteruskan (*routing*) ke OPD terkait.

---

## Sesi 3: Penanganan OPD & Pelacakan Masyarakat (3-4 Menit)
**Tujuan:** Menunjukkan transparansi sistem di mana masyarakat bisa melihat progres kerja OPD.

1. **Pelacakan Awal (Sisi Masyarakat):**
   - *Aksi:* Buka halaman *Tracking* di frontend web. Masukkan nomor tiket dari Sesi 2.
   - *Penjelasan:* Perlihatkan status saat ini (misal: "Diteruskan ke OPD").
2. **Penanganan Aduan (Sisi OPD):**
   - *Aksi:* Login ke Dashboard OPD menggunakan akun OPD tujuan. Buka tiket aduan tersebut.
   - *Penjelasan:* Tunjukkan detail aduan yang diterima OPD.
3. **Update Progres (Sisi OPD):**
   - *Aksi:* Lakukan update status progres. Masukkan deskripsi (Contoh: "Tim sedang meluncur ke lokasi untuk peninjauan") dan **wajib** unggah bukti foto.
   - *Penjelasan:* Tekankan aturan sistem bahwa OPD tidak bisa asal tutup tiket tanpa bukti foto progres.
4. **Cek Pelacakan Real-time (Sisi Masyarakat):**
   - *Aksi:* Kembali ke halaman web pelacakan, *refresh* halaman.
   - *Penjelasan:* Tunjukkan bahwa masyarakat langsung melihat riwayat progres beserta foto penanganan dari OPD secara transparan.

---

## Sesi 4: Demonstrasi Flow Aspirasi & Komentar Medsos (2-3 Menit)
**Tujuan:** Menunjukkan penanganan masukan masyarakat yang sifatnya bukan aduan kerusakan/pelanggaran.

1. **Simulasi Komentar Sosial Media:**
   - *Penjelasan:* Jelaskan bahwa sistem menarik komentar Instagram (atau masyarakat mengirim format aspirasi via bot).
2. **Peninjauan Komentar (Sisi Admin):**
   - *Aksi:* Buka Dashboard Admin menu Peninjauan Komentar.
   - *Penjelasan:* Admin memutuskan apakah sebuah komentar perlu dijadikan tiket aduan atau sekadar dicatat sebagai Aspirasi. Pilih opsi jadikan **Aspirasi**.
3. **Routing & Monitoring Aspirasi:**
   - *Aksi:* Admin meneruskan aspirasi tersebut ke OPD terkait.
   - *Penjelasan:* Tampilkan tabel *Monitoring Aspirasi*. Ingatkan audiens bahwa untuk flow ini, sistem **tidak membuat room chat**, melainkan hanya sebagai dashboard pemantauan internal pemerintah.

---

## Sesi 5: Demonstrasi Flow Permintaan Informasi (3 Menit)
**Tujuan:** Menunjukkan interaksi komunikasi (Room Chat) untuk pertanyaan masyarakat.

1. **Kirim Pertanyaan (Sisi Masyarakat):**
   - *Aksi:* Via bot WA/IG, pilih layanan "Permintaan Informasi". Kirim pertanyaan (Contoh: "Apa syarat perpanjang KTP yang hilang?").
2. **Pembuatan Room Chat (Sisi Admin):**
   - *Aksi:* Di Dashboard Admin, tunjukkan bahwa pertanyaan ini membuat *room chat* khusus. Admin meneruskan pertanyaan ke Disdukcapil (OPD terkait).
3. **Menyiapkan Jawaban (Sisi OPD):**
   - *Aksi:* Di Dashboard OPD, buka *room chat* tersebut. Buat draf balasan untuk masyarakat.
4. **Review dan Pengiriman (Sisi Admin):**
   - *Aksi:* Admin melihat draf jawaban dari OPD, me-review-nya, dan menekan tombol kirim.
   - *Penjelasan:* Tunjukkan simulasi WhatsApp/IG masyarakat bahwa jawaban resmi dari OPD (via Admin) telah diterima.

---

## Sesi 6: Penutup (1-2 Menit)
**Tujuan:** Memberikan kesimpulan yang kuat dan meyakinkan audiens.

1. **Rekapitulasi Keunggulan:**
   - Klasifikasi cepat dengan LLM namun tetap terkontrol oleh Admin.
   - SLA (*Service Level Agreement*) transparan karena setiap progres OPD terpantau.
   - Dukungan multi-platform (WA/IG) tanpa memaksa masyarakat mengunduh aplikasi baru.
2. **Sesi Tanya Jawab (Q&A):**
   - Persilakan audiens/penguji untuk bertanya lebih lanjut.
