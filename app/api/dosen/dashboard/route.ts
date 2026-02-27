import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'DOSEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dosenName = user.name || '';

    // 1. Total Kelas (Schedules assigned to this Dosen)
    const totalKelas = await prisma.semesterMataKuliah.count({
      where: {
        dosen: {
          contains: dosenName,
          mode: 'insensitive'
        },
        semester: {
          status: 'AKTIF'
        },
        isPublished: true
      }
    });

    // 2. Mahasiswa yang butuh nilai
    // Finds all PendaftaranDetails attached to this dosen's classes where Nilai is either missing or not SUBMITTED/LOCKED
    const mahasiswaBelumDinilai = await prisma.pendaftaranDetail.count({
      where: {
        semesterMataKuliah: {
          dosen: {
            contains: dosenName,
            mode: 'insensitive'
          },
          semester: {
            status: 'AKTIF'
          },
          isPublished: true
        },
        pendaftaran: {
          status: 'DITERIMA'
        },
        OR: [
          { nilai: null },
          { nilai: { status: 'DRAFT' } }
        ]
      }
    });

    return NextResponse.json({
      totalKelas,
      mahasiswaBelumDinilai
    });
  } catch (error) {
    console.error('Error fetching dosen dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
