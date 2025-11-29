import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get all semesters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const periode = searchParams.get('periode');

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (periode) {
      where.periode = periode.toUpperCase();
    }

    const semesters = await prisma.semester.findMany({
      where,
      include: {
        mataKuliah: {
          include: {
            mataKuliah: true,
          },
        },
        _count: {
          select: {
            pendaftaran: true,
          },
        },
      },
      orderBy: [
        { tahun: 'desc' },
        { periode: 'desc' },
      ],
    });

    return NextResponse.json({ semesters });
  } catch (error: any) {
    console.error('Get semesters error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data semester' },
      { status: 500 }
    );
  }
}

// POST - Create new semester
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Only admin can create
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat membuat semester.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nama, tahun, periode, tanggalMulai, tanggalSelesai, deadlinePendaftaran, status } = body;

    // Validation
    if (!nama || !tahun || !periode || !tanggalMulai || !tanggalSelesai || !deadlinePendaftaran) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Validate periode
    const validPeriodes = ['GANJIL', 'GENAP'];
    if (!validPeriodes.includes(periode.toUpperCase())) {
      return NextResponse.json(
        { error: 'Periode harus GANJIL atau GENAP' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['AKTIF', 'NONAKTIF'];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Check if semester already exists
    const existingSemester = await prisma.semester.findUnique({
      where: {
        tahun_periode: {
          tahun,
          periode: periode.toUpperCase() as 'GANJIL' | 'GENAP',
        },
      },
    });

    if (existingSemester) {
      return NextResponse.json(
        { error: 'Semester dengan tahun dan periode ini sudah ada' },
        { status: 409 }
      );
    }

    // Create semester
    const newSemester = await prisma.semester.create({
      data: {
        nama,
        tahun,
        periode: periode.toUpperCase() as 'GANJIL' | 'GENAP',
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        deadlinePendaftaran: new Date(deadlinePendaftaran),
        status: (status?.toUpperCase() || 'NONAKTIF') as 'AKTIF' | 'NONAKTIF',
      },
      include: {
        mataKuliah: {
          include: {
            mataKuliah: true,
          },
        },
        _count: {
          select: {
            pendaftaran: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Semester berhasil dibuat',
        semester: newSemester,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create semester error:', error);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Semester dengan tahun dan periode ini sudah ada' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat semester' },
      { status: 500 }
    );
  }
}

