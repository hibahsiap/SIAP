/**
 * clear-data.ts — Bersihkan data operasional sebelum deploy / demonstrasi.
 *
 * DIHAPUS (Admin & OPD):
 *   - Chat            : Conversation, Message
 *   - Comments/Mentions: SocialInteraction
 *   - Tickets/Aspirations: Ticket, TicketProgress, TicketVerification, Approval
 *   - Reports          : tidak ada tabelnya — laporan dihitung dari Ticket/Message,
 *                        jadi otomatis kosong setelah data di atas dihapus.
 *   - User activity log: ActivityLog
 *   - Lampiran          : Attachment (bukti progress, gambar chat/tiket)
 *   - Warga             : Citizen, CitizenContact (pengirim chat/tiket — data operasional)
 *
 * DIPERTAHANKAN (data user & settings):
 *   - User      (akun Admin & OPD)
 *   - Opd       (daftar OPD)
 *   - Category  (kategori isu / settings)
 *   - Channel   (koneksi WhatsApp/Instagram + token — settings)
 *
 * Pemakaian:
 *   npm run clear-data            -> DRY RUN: hanya menampilkan jumlah yang AKAN dihapus
 *   npm run clear-data -- --yes   -> EKSEKUSI penghapusan
 *
 * Catatan: ini hanya menghapus baris di database. File di Supabase Storage
 * (bucket dm-media / lampiran tiket) tidak ikut terhapus.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const confirmed = process.argv.includes('--yes') || process.env.CONFIRM_CLEAR === 'yes'

async function main() {
  // Hitung dulu agar terlihat apa yang akan dihapus / sudah dihapus.
  const before = {
    activityLog: await prisma.activityLog.count(),
    attachment: await prisma.attachment.count(),
    message: await prisma.message.count(),
    approval: await prisma.approval.count(),
    ticketProgress: await prisma.ticketProgress.count(),
    ticketVerification: await prisma.ticketVerification.count(),
    socialInteraction: await prisma.socialInteraction.count(),
    ticket: await prisma.ticket.count(),
    conversation: await prisma.conversation.count(),
    citizenContact: await prisma.citizenContact.count(),
    citizen: await prisma.citizen.count(),
  }

  console.log('\n=== Data operasional saat ini ===')
  for (const [k, v] of Object.entries(before)) console.log(`  ${k.padEnd(20)} : ${v}`)

  console.log('\n=== Data yang DIPERTAHANKAN ===')
  console.log(`  user                 : ${await prisma.user.count()}`)
  console.log(`  opd                  : ${await prisma.opd.count()}`)
  console.log(`  category             : ${await prisma.category.count()}`)
  console.log(`  channel              : ${await prisma.channel.count()}`)

  if (!confirmed) {
    console.log('\n[DRY RUN] Tidak ada yang dihapus. Jalankan ulang dengan `-- --yes` untuk mengeksekusi.\n')
    return
  }

  console.log('\nMenghapus... (urutan aman terhadap foreign key)')

  // Urutan: anak -> induk. Dijalankan dalam satu transaksi (all-or-nothing).
  const result = await prisma.$transaction([
    prisma.activityLog.deleteMany(),        // log aktivitas user
    prisma.attachment.deleteMany(),         // lampiran (anak Message/Ticket)
    prisma.message.deleteMany(),            // chat (anak Conversation/Ticket)
    prisma.approval.deleteMany(),           // approval (dirujuk Message)
    prisma.ticketProgress.deleteMany(),     // progress tiket (anak Ticket)
    prisma.ticketVerification.deleteMany(), // verifikasi tiket (anak Ticket)
    prisma.socialInteraction.deleteMany(),  // comments & mentions (merujuk Ticket)
    prisma.ticket.deleteMany(),             // tiket & aspirasi
    prisma.conversation.deleteMany(),       // percakapan chat
    prisma.citizenContact.deleteMany(),     // kontak warga (anak Citizen)
    prisma.citizen.deleteMany(),            // warga pengirim
  ])

  const labels = [
    'activityLog', 'attachment', 'message', 'approval', 'ticketProgress',
    'ticketVerification', 'socialInteraction', 'ticket', 'conversation',
    'citizenContact', 'citizen',
  ]

  console.log('\n=== Selesai. Jumlah baris terhapus ===')
  result.forEach((r, i) => console.log(`  ${labels[i].padEnd(20)} : ${r.count}`))
  console.log('\n✓ Database dibersihkan. User, OPD, Category, dan Channel dipertahankan.\n')
}

main()
  .catch((e) => {
    console.error('Gagal membersihkan database:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
