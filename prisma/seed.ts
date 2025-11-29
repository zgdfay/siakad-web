import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Create PostgreSQL pool for seed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create PrismaClient with adapter
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password untuk semua user (password: password123)
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
  console.log('✅ Created admin:', admin.nimOrNip);

  // 2. Create Dosen Users
  const dosen1 = await prisma.userMaster.upsert({
    where: { nimOrNip: 'DSN001' },
    update: {},
    create: {
      nimOrNip: 'DSN001',
      name: 'Dr. Ahmad Wijaya, S.T., M.T.',
      role: 'DOSEN',
      status: 'AKTIF',
      account: {
        create: {
          email: 'ahmad.wijaya@itbyadika.ac.id',
          passwordHash,
        },
      },
    },
  });
  console.log('✅ Created dosen 1:', dosen1.nimOrNip);

  const dosen2 = await prisma.userMaster.upsert({
    where: { nimOrNip: 'DSN002' },
    update: {},
    create: {
      nimOrNip: 'DSN002',
      name: 'Dr. Siti Nurhaliza, S.Kom., M.Kom.',
      role: 'DOSEN',
      status: 'AKTIF',
      account: {
        create: {
          email: 'siti.nurhaliza@itbyadika.ac.id',
          passwordHash,
        },
      },
    },
  });
  console.log('✅ Created dosen 2:', dosen2.nimOrNip);

  // 3. Create Mahasiswa Users (beberapa dengan account, beberapa tanpa account untuk testing register)
  const mahasiswaData = [
    {
      nim: '22121001',
      name: 'Budi Santoso',
      email: 'budi.santoso@student.itbyadika.ac.id',
      hasAccount: true,
    },
    {
      nim: '22121002',
      name: 'Siti Aisyah',
      email: 'siti.aisyah@student.itbyadika.ac.id',
      hasAccount: true,
    },
    {
      nim: '22121003',
      name: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@student.itbyadika.ac.id',
      hasAccount: true,
    },
    {
      nim: '22121004',
      name: 'Dewi Lestari',
      email: 'dewi.lestari@student.itbyadika.ac.id',
      hasAccount: false, // Untuk testing register
    },
    {
      nim: '22121005',
      name: 'Rizki Pratama',
      email: 'rizki.pratama@student.itbyadika.ac.id',
      hasAccount: false, // Untuk testing register
    },
    {
      nim: '22121006',
      name: 'Indah Sari',
      email: 'indah.sari@student.itbyadika.ac.id',
      hasAccount: false, // Untuk testing register
    },
    {
      nim: '22121007',
      name: 'Muhammad Rizki',
      email: 'muhammad.rizki@student.itbyadika.ac.id',
      hasAccount: false, // Untuk testing register
    },
    {
      nim: '22121008',
      name: 'Putri Ayu',
      email: 'putri.ayu@student.itbyadika.ac.id',
      hasAccount: false, // Untuk testing register
    },
    {
      nim: '22121009',
      name: 'Fajar Nugroho',
      email: 'fajar.nugroho@student.itbyadika.ac.id',
      hasAccount: false, // Untuk testing register
    },
    {
      nim: '22121010',
      name: 'Lina Marlina',
      email: 'lina.marlina@student.itbyadika.ac.id',
      hasAccount: false, // Untuk testing register
    },
    // Mahasiswa nonaktif untuk testing
    {
      nim: '22121011',
      name: 'Andi Susanto',
      email: 'andi.susanto@student.itbyadika.ac.id',
      hasAccount: false,
      status: 'NONAKTIF' as const,
    },
    // Mahasiswa dengan role berbeda (untuk testing error)
    {
      nim: '22121012',
      name: 'Test User',
      email: 'test.user@student.itbyadika.ac.id',
      hasAccount: false,
      role: 'DOSEN' as const,
    },
  ];

  for (const mhs of mahasiswaData) {
    const userMaster = await prisma.userMaster.upsert({
      where: { nimOrNip: mhs.nim },
      update: {},
      create: {
        nimOrNip: mhs.nim,
        name: mhs.name,
        role: mhs.role || 'MAHASISWA',
        status: mhs.status || 'AKTIF',
        ...(mhs.hasAccount && {
          account: {
            create: {
              email: mhs.email,
              passwordHash,
            },
          },
        }),
      },
    });

    // Jika sudah ada account, update jika perlu
    const userWithAccount = await prisma.userMaster.findUnique({
      where: { id: userMaster.id },
      include: { account: true },
    });

    if (mhs.hasAccount && !userWithAccount?.account) {
      await prisma.account.create({
        data: {
          userMasterId: userMaster.id,
          email: mhs.email,
          passwordHash,
        },
      });
    }

    console.log(
      `✅ Created mahasiswa: ${mhs.nim} - ${mhs.name} ${
        mhs.hasAccount ? '(with account)' : '(no account)'
      }`
    );
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  NIM: ADMIN001');
  console.log('  Email: admin@itbyadika.ac.id');
  console.log('  Password: password123');
  console.log('\nDosen:');
  console.log('  NIM: DSN001');
  console.log('  Email: ahmad.wijaya@itbyadika.ac.id');
  console.log('  Password: password123');
  console.log('\nMahasiswa (sudah punya account):');
  console.log('  NIM: 22121001');
  console.log('  Email: budi.santoso@student.itbyadika.ac.id');
  console.log('  Password: password123');
  console.log('\nMahasiswa (belum punya account - untuk test register):');
  console.log('  NIM: 22121004, 22121005, 22121006, dll');
  console.log('  Email: bisa diisi bebas saat register');
  console.log('  Password: bisa diisi bebas saat register');
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
