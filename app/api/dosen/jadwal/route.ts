import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Jadwal Mengajar Dosen
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'DOSEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Identify dosen. Assuming the schema saves 'dosen' name in SemesterMataKuliah 
    // or relates to UserMaster ID. The current schema says 'dosen String' in SemesterMataKuliah.
    // If it's a string name, we match by name or by NIP if implemented that way.
    // Assuming dosen name matches UserMaster.name for this simple implementation:

    const dosenName = user.name || '';

    // Fetch schedules
    const schedules = await prisma.semesterMataKuliah.findMany({
      where: {
        dosen: {
          contains: dosenName,
          mode: 'insensitive'
        },
        semester: {
          status: 'AKTIF'
        }
      },
      include: {
        mataKuliah: true,
        semester: true,
        _count: {
          select: { pendaftaranDetail: { where: { pendaftaran: { status: 'DITERIMA' } } } }
        }
      },
      orderBy: {
        createdAt: 'desc'
        // jadwal can't be purely ordered if it's string array
      }
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching dosen schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
