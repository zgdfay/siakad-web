import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List semua peserta per kelas (Untuk Rekap CSV)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'PANITIA' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const semesterIdFilter = searchParams.get('semesterId');
    const mkIdFilter = searchParams.get('mataKuliahId');

    const result = await prisma.semesterMataKuliah.findMany({
      where: {
        ...(semesterIdFilter ? { semesterId: semesterIdFilter } : {}),
        ...(mkIdFilter ? { mataKuliahId: mkIdFilter } : {}),
      },
      include: {
        mataKuliah: true,
        semester: true,
        pendaftaranDetail: {
          where: {
            pendaftaran: {
              status: 'DITERIMA'
            }
          },
          include: {
            pendaftaran: {
              include: {
                userMaster: {
                  select: { name: true, nimOrNip: true }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching rekap peserta:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
