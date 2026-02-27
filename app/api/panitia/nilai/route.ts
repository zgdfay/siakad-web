import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List semua nilai per kelas untuk diarsip/dikunci Panitia
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'PANITIA' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const semMkId = searchParams.get('semesterMataKuliahId');

    const result = await prisma.semesterMataKuliah.findMany({
      where: semMkId ? { id: semMkId } : {},
      include: {
        mataKuliah: true,
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
            },
            nilai: true
          }
        }
      }
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error fetching nilai for panitia:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Lock/Arsip Nilai
export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'PANITIA' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { semesterMataKuliahId } = body;

    if (!semesterMataKuliahId) {
      return NextResponse.json({ error: 'SemesterMataKuliah ID required' }, { status: 400 });
    }

    // Lock all submitted/draft nilai in this class
    const updated = await prisma.nilai.updateMany({
      where: {
        pendaftaranDetail: {
          semesterMataKuliahId: semesterMataKuliahId
        },
        status: {
          not: 'LOCKED'
        }
      },
      data: {
        status: 'LOCKED'
      }
    });

    return NextResponse.json({ message: `${updated.count} nilai berhasil dikunci/diarsipkan` });
  } catch (error) {
    console.error('Error locking nilai:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
