import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get semester by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const semesterId = resolvedParams.id;

    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: {
        mataKuliah: {
          include: {
            mataKuliah: true,
          },
          orderBy: {
            mataKuliah: {
              kode: 'asc',
            },
          },
        },
        _count: {
          select: {
            pendaftaran: true,
          },
        },
      },
    });

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ semester });
  } catch (error: any) {
    console.error('Get semester error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data semester' },
      { status: 500 }
    );
  }
}

// PUT - Update semester
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Only admin can update
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengupdate semester.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const semesterId = resolvedParams.id;

    const body = await request.json();
    const { nama, tahun, periode, tanggalMulai, tanggalSelesai, deadlinePendaftaran, status } = body;

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!existingSemester) {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate periode if provided
    if (periode) {
      const validPeriodes = ['GANJIL', 'GENAP'];
      if (!validPeriodes.includes(periode.toUpperCase())) {
        return NextResponse.json(
          { error: 'Periode harus GANJIL atau GENAP' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['AKTIF', 'NONAKTIF'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        );
      }
    }

    // Check if tahun+periode combination already exists (if changed)
    if (tahun || periode) {
      const checkTahun = tahun || existingSemester.tahun;
      const checkPeriode = (periode?.toUpperCase() || existingSemester.periode) as 'GANJIL' | 'GENAP';
      
      if (checkTahun !== existingSemester.tahun || checkPeriode !== existingSemester.periode) {
        const duplicateSemester = await prisma.semester.findUnique({
          where: {
            tahun_periode: {
              tahun: checkTahun,
              periode: checkPeriode,
            },
          },
        });

        if (duplicateSemester && duplicateSemester.id !== semesterId) {
          return NextResponse.json(
            { error: 'Semester dengan tahun dan periode ini sudah ada' },
            { status: 409 }
          );
        }
      }
    }

    // Update semester
    const updateData: any = {};
    if (nama) updateData.nama = nama;
    if (tahun) updateData.tahun = tahun;
    if (periode) updateData.periode = periode.toUpperCase();
    if (tanggalMulai) updateData.tanggalMulai = new Date(tanggalMulai);
    if (tanggalSelesai) updateData.tanggalSelesai = new Date(tanggalSelesai);
    if (deadlinePendaftaran) updateData.deadlinePendaftaran = new Date(deadlinePendaftaran);
    if (status) updateData.status = status.toUpperCase();

    const updatedSemester = await prisma.semester.update({
      where: { id: semesterId },
      data: updateData,
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

    return NextResponse.json({
      message: 'Semester berhasil diperbarui',
      semester: updatedSemester,
    });
  } catch (error: any) {
    console.error('Update semester error:', error);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Semester dengan tahun dan periode ini sudah ada' },
        { status: 409 }
      );
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate semester' },
      { status: 500 }
    );
  }
}

// DELETE - Delete semester
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Only admin can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat menghapus semester.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const semesterId = resolvedParams.id;

    // Check if semester exists
    const existingSemester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: {
        _count: {
          select: {
            pendaftaran: true,
          },
        },
      },
    });

    if (!existingSemester) {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if semester has pendaftaran
    if (existingSemester._count.pendaftaran > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus semester yang sudah memiliki pendaftaran' },
        { status: 409 }
      );
    }

    // Delete semester (cascade will delete mataKuliah relations)
    await prisma.semester.delete({
      where: { id: semesterId },
    });

    return NextResponse.json(
      { message: 'Semester berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete semester error:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus semester' },
      { status: 500 }
    );
  }
}

