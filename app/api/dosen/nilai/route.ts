import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List mahasiswa dalam suatu kelas
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'DOSEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const semMkId = searchParams.get('semesterMataKuliahId');

    if (!semMkId) {
      return NextResponse.json({ error: 'Parameter semesterMataKuliahId required' }, { status: 400 });
    }

    const students = await prisma.pendaftaranDetail.findMany({
      where: {
        semesterMataKuliahId: semMkId,
        pendaftaran: {
          status: 'DITERIMA'
        }
      },
      include: {
        pendaftaran: {
          include: {
            userMaster: {
              select: {
                name: true,
                nimOrNip: true
              }
            }
          }
        },
        nilai: true
      },
      orderBy: {
        pendaftaran: {
          userMaster: {
            nimOrNip: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching class students for Nilai:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST / PUT - Input/Update Nilai
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'DOSEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pendaftaranDetailId, nilaiAngka, nilaiHuruf, status } = body;

    if (!pendaftaranDetailId || (!nilaiAngka && !nilaiHuruf)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Check if Nilai already exists and is locked
    const existing = await prisma.nilai.findUnique({
      where: { pendaftaranDetailId }
    });

    if (existing?.status === 'LOCKED') {
      return NextResponse.json({ error: 'Nilai sudah dikunci oleh Panitia dan tidak bisa diubah' }, { status: 400 });
    }

    const upsertedNilai = await prisma.nilai.upsert({
      where: { pendaftaranDetailId },
      update: {
        nilaiAngka: nilaiAngka ? parseFloat(nilaiAngka) : null,
        nilaiHuruf: nilaiHuruf || null,
        status: status || 'DRAFT'
      },
      create: {
        pendaftaranDetailId,
        nilaiAngka: nilaiAngka ? parseFloat(nilaiAngka) : null,
        nilaiHuruf: nilaiHuruf || null,
        status: status || 'DRAFT'
      }
    });

    return NextResponse.json({ message: 'Nilai berhasil disimpan', nilai: upsertedNilai });
  } catch (error) {
    console.error('Error saving nilai:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
