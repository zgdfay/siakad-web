import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

// Muat .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function main() {
  // Setup dotenv sebelum import database
  const { prisma } = await import('../lib/prisma');

  console.log('Menghapus data (kecuali UserMaster & Account)...');
  console.log('Pastikan Anda yakin mau menghapus ini semua!');
  
  // Hapus berurutan dari child ke parent untuk menghindari foreign key constraint error
  console.log('Menghapus Nilai...');
  await prisma.nilai.deleteMany();
  
  console.log('Menghapus Payment...');
  await prisma.payment.deleteMany();
  
  console.log('Menghapus PendaftaranDetail...');
  await prisma.pendaftaranDetail.deleteMany();
  
  console.log('Menghapus Pendaftaran...');
  await prisma.pendaftaran.deleteMany();
  
  console.log('Menghapus SemesterMataKuliah (Jadwal)...');
  await prisma.semesterMataKuliah.deleteMany();
  
  console.log('Menghapus Semester...');
  await prisma.semester.deleteMany();
  
  console.log('Menghapus MataKuliah master...');
  await prisma.mataKuliah.deleteMany();

  console.log('\n✅ Berhasil menghapus semua data operasional.');
  console.log('💾 Data akun User (UserMaster & Account) tetap dipertahankan.');
}

main().catch((e) => {
  console.error('Terjadi kesalahan:', e);
  process.exit(1);
});
