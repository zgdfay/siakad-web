import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get all mata kuliah
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const kategori = searchParams.get('kategori');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (kategori) {
      where.kategori = kategori.toUpperCase();
    }
    if (search) {
      where.OR = [
        { kode: { contains: search, mode: 'insensitive' } },
        { nama: { contains: search, mode: 'insensitive' } },
        { prodi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const mataKuliah = await prisma.mataKuliah.findMany({
      where,
      include: {
        semester: {
          include: {
            semester: true,
          },
        },
      },
      orderBy: {
        kode: 'asc',
      },
    });

    return NextResponse.json({ mataKuliah });
  } catch (error: any) {
    console.error('Get mata kuliah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data mata kuliah' },
      { status: 500 }
    );
  }
}

// POST - Create new mata kuliah
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
        { error: 'Akses ditolak. Hanya admin yang dapat membuat mata kuliah.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { kode, nama, sks, prodi, kategori, status, deskripsi, semesterId } = body;

    // Validation
    if (!kode || !nama || !sks || !prodi || !kategori) {
      return NextResponse.json(
        { error: 'Kode, nama, SKS, prodi, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Validate SKS
    if (sks < 1 || sks > 6) {
      return NextResponse.json(
        { error: 'SKS harus antara 1-6' },
        { status: 400 }
      );
    }

    // Validate kategori
    const validKategoris = ['WAJIB', 'PILIHAN'];
    if (!validKategoris.includes(kategori.toUpperCase())) {
      return NextResponse.json(
        { error: 'Kategori harus WAJIB atau PILIHAN' },
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

    // Check if kode already exists
    const existingMataKuliah = await prisma.mataKuliah.findUnique({
      where: { kode },
    });

    if (existingMataKuliah) {
      return NextResponse.json(
        { error: 'Kode mata kuliah sudah terdaftar' },
        { status: 409 }
      );
    }

    // If semesterId is provided, verify semester exists
    if (semesterId) {
      const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
      });
      if (!semester) {
        return NextResponse.json(
          { error: 'Semester tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    // Create mata kuliah and optionally assign to semester in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newMataKuliah = await tx.mataKuliah.create({
        data: {
          kode,
          nama,
          sks: parseInt(sks.toString()),
          prodi,
          kategori: kategori.toUpperCase() as 'WAJIB' | 'PILIHAN',
          status: (status?.toUpperCase() || 'AKTIF') as 'AKTIF' | 'NONAKTIF',
          deskripsi: deskripsi || null,
          biaya: parseInt(body.biaya?.toString() || '0'),
        },
      });

      // If semesterId provided, create SemesterMataKuliah to link them
      if (semesterId) {
        await tx.semesterMataKuliah.create({
          data: {
            semesterId,
            mataKuliahId: newMataKuliah.id,
            kelas: 'A',
            jadwal: '-',
            dosen: '-',
            kuota: 30,
            terisi: 0,
          },
        });
      }

      // Re-fetch with relations
      return tx.mataKuliah.findUnique({
        where: { id: newMataKuliah.id },
        include: {
          semester: {
            include: {
              semester: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: 'Mata kuliah berhasil dibuat',
        mataKuliah: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create mata kuliah error:', error);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kode mata kuliah sudah terdaftar' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat mata kuliah' },
      { status: 500 }
    );
  }
}

