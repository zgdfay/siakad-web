import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting admin seed...');

  // Hash password untuk admin (password: password123)
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin User
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

  console.log('✅ Admin created:', admin.nimOrNip);
  console.log('\n📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  NIM: ADMIN001');
  console.log('  Email: admin@itbyadika.ac.id');
  console.log('  Password: password123');
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
