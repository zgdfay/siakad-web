import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'PANITIA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Metrics query for active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { status: 'AKTIF' }
    });

    let totalPendaftaran = 0;
    let belumDiverifikasi = 0;
    let jadwalDipublish = 0;

    if (activeSemester) {
      // 1. Total Registrations matching active semester
      totalPendaftaran = await prisma.pendaftaran.count({
        where: { semesterId: activeSemester.id }
      });

      // 2. Pending verifications
      belumDiverifikasi = await prisma.pendaftaran.count({
        where: {
          semesterId: activeSemester.id,
          status: 'MENUNGGU_VERIFIKASI'
        }
      });

      // 3. Published Schedules
      jadwalDipublish = await prisma.semesterMataKuliah.count({
        where: {
          semesterId: activeSemester.id,
          isPublished: true
        }
      });
    }

    return NextResponse.json({
      totalPendaftaran,
      belumDiverifikasi,
      jadwalDipublish
    });
  } catch (error) {
    console.error('Error fetching panitia dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
