import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get mata kuliah by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const mataKuliahId = resolvedParams.id;

    const mataKuliah = await prisma.mataKuliah.findUnique({
      where: { id: mataKuliahId },
      include: {
        semester: {
          include: {
            semester: {
              select: {
                id: true,
                nama: true,
                tahun: true,
                periode: true,
              },
            },
          },
        },
      },
    });

    if (!mataKuliah) {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ mataKuliah });
  } catch (error: any) {
    console.error('Get mata kuliah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data mata kuliah' },
      { status: 500 }
    );
  }
}

// PUT - Update mata kuliah
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
        { error: 'Akses ditolak. Hanya admin yang dapat mengupdate mata kuliah.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const mataKuliahId = resolvedParams.id;

    const body = await request.json();
    const { kode, nama, sks, prodi, kategori, status, deskripsi } = body;

    // Check if mata kuliah exists
    const existingMataKuliah = await prisma.mataKuliah.findUnique({
      where: { id: mataKuliahId },
    });

    if (!existingMataKuliah) {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate SKS if provided
    if (sks !== undefined) {
      if (sks < 1 || sks > 6) {
        return NextResponse.json(
          { error: 'SKS harus antara 1-6' },
          { status: 400 }
        );
      }
    }

    // Validate kategori if provided
    if (kategori) {
      const validKategoris = ['WAJIB', 'PILIHAN'];
      if (!validKategoris.includes(kategori.toUpperCase())) {
        return NextResponse.json(
          { error: 'Kategori harus WAJIB atau PILIHAN' },
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

    // Check if kode already exists (if changed)
    if (kode && kode !== existingMataKuliah.kode) {
      const duplicateKode = await prisma.mataKuliah.findUnique({
        where: { kode },
      });

      if (duplicateKode) {
        return NextResponse.json(
          { error: 'Kode mata kuliah sudah terdaftar' },
          { status: 409 }
        );
      }
    }

    // Update mata kuliah
    const updateData: any = {};
    if (kode) updateData.kode = kode;
    if (nama) updateData.nama = nama;
    if (sks !== undefined) updateData.sks = parseInt(sks);
    if (prodi) updateData.prodi = prodi;
    if (kategori) updateData.kategori = kategori.toUpperCase();
    if (status) updateData.status = status.toUpperCase();
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi || null;

    const updatedMataKuliah = await prisma.mataKuliah.update({
      where: { id: mataKuliahId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Mata kuliah berhasil diperbarui',
      mataKuliah: updatedMataKuliah,
    });
  } catch (error: any) {
    console.error('Update mata kuliah error:', error);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kode mata kuliah sudah terdaftar' },
        { status: 409 }
      );
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate mata kuliah' },
      { status: 500 }
    );
  }
}

// DELETE - Delete mata kuliah
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
        { error: 'Akses ditolak. Hanya admin yang dapat menghapus mata kuliah.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const mataKuliahId = resolvedParams.id;

    // Check if mata kuliah exists
    const existingMataKuliah = await prisma.mataKuliah.findUnique({
      where: { id: mataKuliahId },
      include: {
        semester: {
          include: {
            _count: {
              select: {
                pendaftaranDetail: true,
              },
            },
          },
        },
      },
    });

    if (!existingMataKuliah) {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if mata kuliah is used in any semester with pendaftaran
    const hasPendaftaran = existingMataKuliah.semester.some(
      (sm) => sm._count.pendaftaranDetail > 0
    );

    if (hasPendaftaran) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus mata kuliah yang sudah memiliki pendaftaran' },
        { status: 409 }
      );
    }

    // Delete mata kuliah (cascade will delete semester relations)
    await prisma.mataKuliah.delete({
      where: { id: mataKuliahId },
    });

    return NextResponse.json(
      { message: 'Mata kuliah berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete mata kuliah error:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus mata kuliah' },
      { status: 500 }
    );
  }
}

