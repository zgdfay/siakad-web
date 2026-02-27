import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'KEUANGAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Metrics query for active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { status: 'AKTIF' }
    });

    let totalPendapatan = 0;
    let belumDiverifikasi = 0;
    let sudahLunas = 0;

    if (activeSemester) {
      // 1. Total Lunas Payments within current semester
      const lunasPayments = await prisma.payment.findMany({
        where: {
          status: 'LUNAS',
          pendaftaran: {
            semesterId: activeSemester.id
          }
        },
        select: {
          jumlah: true
        }
      });
      totalPendapatan = lunasPayments.reduce((sum, p) => sum + p.jumlah, 0);

      // 2. Pending verifications
      belumDiverifikasi = await prisma.payment.count({
        where: {
          status: 'MENUNGGU_VERIFIKASI',
          pendaftaran: {
            semesterId: activeSemester.id
          }
        }
      });

      // 3. Total Lunas count
      sudahLunas = lunasPayments.length;
    }

    return NextResponse.json({
      totalPendapatan: totalPendapatan || 0,
      belumDiverifikasi,
      sudahLunas
    });
  } catch (error) {
    console.error('Error fetching keuangan dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
