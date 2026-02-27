import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Muat .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function pingDatabase() {
  const { prisma } = await import('../lib/prisma');
  console.log(`[${new Date().toISOString()}] Mengirim ping query ke database...`);
  try {
    // Jalankan query super ringan untuk membangunkan / menjaga koneksi database
    await prisma.$queryRaw`SELECT 1`;
    console.log(`[${new Date().toISOString()}] Database merespon dengan baik. Status: ACTIVE`);
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error saat ping database:`, error.message);
  }
}

async function startKeepAlive() {
  console.log('🚀 Supabase Keep-Alive Script Berjalan 🚀');
  console.log('Script ini akan melakukan query "SELECT 1" ke database setiap 15 menit.');
  console.log('Biarkan terminal ini berjalan di background agar Supabase Anda tidak "pause" karena inaktif.\n');

  // Lakukan ping pertama kali saat script dijalankan
  await pingDatabase();

  // Jadwalkan ping setiap 15 menit (15 * 60 * 1000 ms = 900.000 ms)
  setInterval(async () => {
    await pingDatabase();
  }, 15 * 60 * 1000);
}

startKeepAlive();
