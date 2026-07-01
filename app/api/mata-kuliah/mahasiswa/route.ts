import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Mahasiswa creates their own mata kuliah and assigns it to a semester
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

    // Only MAHASISWA can use this endpoint
    if (user.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Akses ditolak. Endpoint ini hanya untuk mahasiswa.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { kode, nama, sks, prodi, semesterId, mataKuliahId } = body;

    // Validation
    if (!semesterId) {
      return NextResponse.json(
        { error: 'Semester ID wajib diisi' },
        { status: 400 }
      );
    }

    if (!mataKuliahId && (!kode || !nama || !sks || !prodi)) {
      return NextResponse.json(
        { error: 'Pilih mata kuliah yang tersedia atau isi lengkap data mata kuliah baru' },
        { status: 400 }
      );
    }

    // Verify semester exists and is active
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 }
      );
    }

    if (semester.status !== 'AKTIF') {
      return NextResponse.json(
        { error: 'Semester tidak aktif' },
        { status: 400 }
      );
    }

    // Check deadline
    if (new Date() > new Date(semester.deadlinePendaftaran)) {
      return NextResponse.json(
        { error: 'Deadline pendaftaran sudah lewat' },
        { status: 400 }
      );
    }

    // Check if mata kuliah already exists by ID or kode
    let existingMataKuliah = null;
    if (mataKuliahId) {
      existingMataKuliah = await prisma.mataKuliah.findUnique({
        where: { id: mataKuliahId },
      });
    }
    if (!existingMataKuliah && kode) {
      existingMataKuliah = await prisma.mataKuliah.findUnique({
        where: { kode },
      });
    }

    if (existingMataKuliah) {
      // If the mata kuliah already exists, check if it's already assigned to this semester
      const existingAssignment = await prisma.semesterMataKuliah.findFirst({
        where: {
          semesterId,
          mataKuliahId: existingMataKuliah.id,
        },
      });

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'Mata kuliah ini sudah tersedia di semester antara ini' },
          { status: 409 }
        );
      }

      // Assign existing mata kuliah to semester
      const assignment = await prisma.semesterMataKuliah.create({
        data: {
          semesterId,
          mataKuliahId: existingMataKuliah.id,
          kelas: 'A',
          jadwal: '-',
          dosen: '-',
          kuota: 30,
          terisi: 0,
        },
        include: {
          mataKuliah: true,
        },
      });

      return NextResponse.json(
        {
          message: 'Mata kuliah berhasil ditambahkan ke semester',
          semesterMataKuliah: assignment,
        },
        { status: 201 }
      );
    }

    // Create new mata kuliah and assign to semester in a transaction
    const parsedSks = parseInt(sks?.toString() || '0');
    if (parsedSks < 1 || parsedSks > 6) {
      return NextResponse.json(
        { error: 'SKS untuk mata kuliah baru harus antara 1-6' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const newMataKuliah = await tx.mataKuliah.create({
        data: {
          kode,
          nama,
          sks: parsedSks,
          prodi,
          kategori: 'PILIHAN',
          status: 'AKTIF',
          biaya: 250000, // Default flat rate
        },
      });

      // Create SemesterMataKuliah to link them
      const assignment = await tx.semesterMataKuliah.create({
        data: {
          semesterId,
          mataKuliahId: newMataKuliah.id,
          kelas: 'A',
          jadwal: '-',
          dosen: '-',
          kuota: 30,
          terisi: 0,
        },
        include: {
          mataKuliah: true,
        },
      });

      return assignment;
    });

    return NextResponse.json(
      {
        message: 'Mata kuliah berhasil dibuat dan ditambahkan ke semester',
        semesterMataKuliah: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Mahasiswa create mata kuliah error:', error);

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
