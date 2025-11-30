import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH - Update status jadwal
export async function PATCH(
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

    // Only mahasiswa can update their own jadwal status
    if (user.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya mahasiswa yang dapat memperbarui status jadwal.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranDetailId = resolvedParams.id;

    const body = await request.json();
    const { statusJadwal } = body;

    // Validate statusJadwal
    if (!statusJadwal || !['AKTIF', 'SELESAI'].includes(statusJadwal)) {
      return NextResponse.json(
        { error: 'Status jadwal tidak valid. Harus AKTIF atau SELESAI.' },
        { status: 400 }
      );
    }

    // Check if pendaftaran detail exists and belongs to the user
    const pendaftaranDetail = await prisma.pendaftaranDetail.findUnique({
      where: { id: pendaftaranDetailId },
      include: {
        pendaftaran: {
          include: {
            semester: true,
          },
        },
      },
    });

    if (!pendaftaranDetail) {
      return NextResponse.json(
        { error: 'Detail pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify that the pendaftaran belongs to the current user
    if (pendaftaranDetail.pendaftaran.userMasterId !== user.id) {
      return NextResponse.json(
        { error: 'Akses ditolak. Anda tidak memiliki akses ke jadwal ini.' },
        { status: 403 }
      );
    }

    // Verify that the pendaftaran is accepted
    if (pendaftaranDetail.pendaftaran.status !== 'DITERIMA') {
      return NextResponse.json(
        { error: 'Hanya jadwal dari pendaftaran yang diterima yang dapat diperbarui.' },
        { status: 400 }
      );
    }

    // Update status jadwal
    const updated = await prisma.pendaftaranDetail.update({
      where: { id: pendaftaranDetailId },
      data: { statusJadwal },
      include: {
        semesterMataKuliah: {
          include: {
            mataKuliah: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Status jadwal berhasil diperbarui',
      pendaftaranDetail: updated,
    });
  } catch (error: any) {
    console.error('Update status jadwal error:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Detail pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui status jadwal' },
      { status: 500 }
    );
  }
}

