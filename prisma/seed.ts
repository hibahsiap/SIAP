import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const OPD_LIST = [
  { name: 'Dinas Komunikasi dan Informatika',        key: 'diskominfo', email: 'diskominfo@hibah.go.id', phone: '0812-0001-0001' },
  { name: 'Dinas Sosial',                            key: 'dinsos',     email: 'dinsos@hibah.go.id',     phone: '0812-0001-0002' },
  { name: 'Dinas Perhubungan',                       key: 'dishub',     email: 'dishub@hibah.go.id',     phone: '0812-0001-0003' },
  { name: 'Dinas Pendidikan',                        key: 'disdik',     email: 'disdik@hibah.go.id',     phone: '0812-0001-0004' },
  { name: 'Dinas Kesehatan',                         key: 'dinkes',     email: 'dinkes@hibah.go.id',     phone: '0812-0001-0005' },
  { name: 'Dinas Pekerjaan Umum dan Penataan Ruang', key: 'pupr',       email: 'pupr@hibah.go.id',       phone: '0812-0001-0006' },
  { name: 'Dinas Lingkungan Hidup',                  key: 'dlh',        email: 'dlh@hibah.go.id',        phone: '0812-0001-0007' },
  { name: 'Dinas Kependudukan dan Pencatatan Sipil', key: 'dukcapil',   email: 'dukcapil@hibah.go.id',   phone: '0812-0001-0008' },
  { name: 'Dinas Perdagangan',                       key: 'disdag',     email: 'disdag@hibah.go.id',     phone: '0812-0001-0009' },
  { name: 'Badan Penanggulangan Bencana Daerah',     key: 'bpbd',       email: 'bpbd@hibah.go.id',       phone: '0812-0001-0010' },
]

const CATEGORY_LIST = [
  { name: 'Jalan dan Infrastruktur', slug: 'jalan-infrastruktur', opdKey: 'pupr'       },
  { name: 'Sampah dan Kebersihan',   slug: 'sampah-kebersihan',   opdKey: 'dlh'        },
  { name: 'Banjir dan Bencana',      slug: 'banjir-bencana',      opdKey: 'bpbd'       },
  { name: 'Pendidikan',              slug: 'pendidikan',           opdKey: 'disdik'     },
  { name: 'Kesehatan',               slug: 'kesehatan',            opdKey: 'dinkes'     },
  { name: 'Kependudukan',            slug: 'kependudukan',         opdKey: 'dukcapil'   },
  { name: 'Bantuan Sosial',          slug: 'bantuan-sosial',       opdKey: 'dinsos'     },
  { name: 'Transportasi',            slug: 'transportasi',         opdKey: 'dishub'     },
  { name: 'Teknologi dan Internet',  slug: 'teknologi-internet',   opdKey: 'diskominfo' },
  { name: 'Perdagangan dan UMKM',    slug: 'perdagangan-umkm',     opdKey: 'disdag'     },
]

async function main() {
  const password = await bcrypt.hash('password123', 10)

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hibah.go.id' },
    update: {},
    create: {
      email: 'admin@hibah.go.id',
      password: await bcrypt.hash('admin123', 10),
      name: 'Administrator',
      phone: '0812-0000-0000',
      role: 'ADMIN',
    },
  })
  console.log(`✓ Admin: ${admin.email}`)

  // OPD + User per OPD
  const opdMap: Record<string, string> = {}

  for (const opd of OPD_LIST) {
    const created = await prisma.opd.upsert({
      where: { name: opd.name },
      update: {},
      create: { name: opd.name },
    })
    opdMap[opd.key] = created.id

    const user = await prisma.user.upsert({
      where: { email: opd.email },
      update: {},
      create: {
        email: opd.email,
        password,
        name: opd.name,
        phone: opd.phone,
        role: 'OPD',
        opdId: created.id,
      },
    })
    console.log(`✓ OPD: ${created.name} — User: ${user.email}`)
  }

  // Categories
  for (const cat of CATEGORY_LIST) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        defaultOpdId: opdMap[cat.opdKey],
      },
    })
    console.log(`✓ Category: ${cat.name}`)
  }

  console.log('\nSeed selesai.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
