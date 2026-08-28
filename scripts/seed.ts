// scripts/seed.ts — Seed data awal ke database (via API backend)
// Jalankan: npx ts-node scripts/seed.ts

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8000'

async function seed() {
  console.log('🌱 Seeding data awal E-CAKRA...')

  // Contoh: buat user admin awal
  const res = await fetch(`${BASE_URL}/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: process.env.SEED_SECRET }),
  })

  if (!res.ok) {
    console.error('❌ Seed gagal:', await res.text())
    process.exit(1)
  }

  console.log('✅ Seed selesai.')
}

seed()
