import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin User
  const admin = await prisma.userMaster.upsert({
    where: { nimOrNip: 'ADMIN001' },
    update: {},
    create: {
      nimOrNip: 'ADMIN001',
      name: 'Admin Sistem',
      role: 'ADMIN',
      status: 'AKTIF',
      account: {
        create: {
          email: 'admin@itbyadika.ac.id',
          passwordHash,
        },
      },
    },
  });

  // 2. Create Panitia User
  const panitia = await prisma.userMaster.upsert({
    where: { nimOrNip: 'PANITIA001' },
    update: {},
    create: {
      nimOrNip: 'PANITIA001',
      name: 'Panitia SA',
      role: 'PANITIA',
      status: 'AKTIF',
      account: {
        create: {
          email: 'panitia@itbyadika.ac.id',
          passwordHash,
        },
      },
    },
  });

  // 3. Create Keuangan User
  const keuangan = await prisma.userMaster.upsert({
    where: { nimOrNip: 'KEUANGAN001' },
    update: {},
    create: {
      nimOrNip: 'KEUANGAN001',
      name: 'Staf Keuangan',
      role: 'KEUANGAN',
      status: 'AKTIF',
      account: {
        create: {
          email: 'keuangan@itbyadika.ac.id',
          passwordHash,
        },
      },
    },
  });

  // 4. Create Dosen User
  const dosen = await prisma.userMaster.upsert({
    where: { nimOrNip: 'DOSEN001' },
    update: {},
    create: {
      nimOrNip: 'DOSEN001',
      name: 'Budi Dosen, M.Kom',
      role: 'DOSEN',
      status: 'AKTIF',
      account: {
        create: {
          email: 'dosen@itbyadika.ac.id',
          passwordHash,
        },
      },
    },
  });

  // 5. Create Mahasiswa User
  const mahasiswa = await prisma.userMaster.upsert({
    where: { nimOrNip: 'MHS001' },
    update: {},
    create: {
      nimOrNip: 'MHS001',
      name: 'Andi Mahasiswa',
      role: 'MAHASISWA',
      status: 'AKTIF',
      account: {
        create: {
          email: 'mahasiswa@itbyadika.ac.id',
          passwordHash,
        },
      },
    },
  });

  console.log('✅ Seed completed successfully!\n');
  console.log('📝 Test Credentials (Password: password123):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Role      | Email                      | NIM/NIP');
  console.log('----------|----------------------------|------------');
  console.log('Admin     | admin@itbyadika.ac.id      |', admin.nimOrNip);
  console.log('Panitia   | panitia@itbyadika.ac.id    |', panitia.nimOrNip);
  console.log('Keuangan  | keuangan@itbyadika.ac.id   |', keuangan.nimOrNip);
  console.log('Dosen     | dosen@itbyadika.ac.id      |', dosen.nimOrNip);
  console.log('Mahasiswa | mahasiswa@itbyadika.ac.id  |', mahasiswa.nimOrNip);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
