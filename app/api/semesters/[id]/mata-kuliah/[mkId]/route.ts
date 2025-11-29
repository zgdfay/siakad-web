import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT - Update semester mata kuliah
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mkId: string }> | { id: string; mkId: string } }
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
        { error: 'Akses ditolak. Hanya admin yang dapat mengupdate mata kuliah semester.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: semesterId, mkId: semesterMataKuliahId } = resolvedParams;

    const body = await request.json();
    const { kelas, jadwal, dosen, kuota, biaya, prasyarat } = body;

    // Check if assignment exists
    const existing = await prisma.semesterMataKuliah.findUnique({
      where: { id: semesterMataKuliahId },
      include: {
        _count: {
          select: {
            pendaftaranDetail: true,
          },
        },
      },
    });

    if (!existing || existing.semesterId !== semesterId) {
      return NextResponse.json(
        { error: 'Mata kuliah semester tidak ditemukan' },
        { status: 404 }
      );
    }

    // Can't reduce kuota below terisi
    if (kuota !== undefined && parseInt(kuota) < existing.terisi) {
      return NextResponse.json(
        { error: `Kuota tidak boleh kurang dari jumlah terisi (${existing.terisi})` },
        { status: 400 }
      );
    }

    // Update assignment
    const updateData: any = {};
    if (kelas) updateData.kelas = kelas;
    if (jadwal) updateData.jadwal = jadwal;
    if (dosen) updateData.dosen = dosen;
    if (kuota !== undefined) updateData.kuota = parseInt(kuota);
    if (biaya !== undefined) updateData.biaya = parseInt(biaya);
    if (prasyarat !== undefined) updateData.prasyarat = prasyarat || null;

    const updated = await prisma.semesterMataKuliah.update({
      where: { id: semesterMataKuliahId },
      data: updateData,
      include: {
        mataKuliah: true,
      },
    });

    return NextResponse.json({
      message: 'Mata kuliah semester berhasil diperbarui',
      semesterMataKuliah: updated,
    });
  } catch (error: any) {
    console.error('Update semester mata kuliah error:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Mata kuliah semester tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate mata kuliah semester' },
      { status: 500 }
    );
  }
}

// DELETE - Remove mata kuliah from semester
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mkId: string }> | { id: string; mkId: string } }
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
        { error: 'Akses ditolak. Hanya admin yang dapat menghapus mata kuliah semester.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const { id: semesterId, mkId: semesterMataKuliahId } = resolvedParams;

    // Check if assignment exists
    const existing = await prisma.semesterMataKuliah.findUnique({
      where: { id: semesterMataKuliahId },
      include: {
        _count: {
          select: {
            pendaftaranDetail: true,
          },
        },
      },
    });

    if (!existing || existing.semesterId !== semesterId) {
      return NextResponse.json(
        { error: 'Mata kuliah semester tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if has pendaftaran
    if (existing._count.pendaftaranDetail > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus mata kuliah yang sudah memiliki pendaftaran' },
        { status: 409 }
      );
    }

    // Delete assignment
    await prisma.semesterMataKuliah.delete({
      where: { id: semesterMataKuliahId },
    });

    return NextResponse.json(
      { message: 'Mata kuliah berhasil dihapus dari semester' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete semester mata kuliah error:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Mata kuliah semester tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus mata kuliah semester' },
      { status: 500 }
    );
  }
}

