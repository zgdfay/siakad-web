import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get all mata kuliah in a semester
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const semesterId = resolvedParams.id;

    if (!semesterId) {
      return NextResponse.json(
        { error: 'Semester ID tidak valid' },
        { status: 400 }
      );
    }

    console.log('Fetching mata kuliah for semester:', semesterId);

    const semesterMataKuliah = await prisma.semesterMataKuliah.findMany({
      where: { semesterId },
      include: {
        mataKuliah: true,
        _count: {
          select: {
            pendaftaranDetail: true,
          },
        },
      },
      orderBy: {
        mataKuliah: {
          kode: 'asc',
        },
      },
    });

    console.log('Found mata kuliah:', semesterMataKuliah.length);

    return NextResponse.json({ mataKuliah: semesterMataKuliah });
  } catch (error: any) {
    console.error('Get semester mata kuliah error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data mata kuliah semester' },
      { status: 500 }
    );
  }
}

// POST - Assign mata kuliah to semester
export async function POST(
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

    // Only admin can assign
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengassign mata kuliah.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const semesterId = resolvedParams.id;

    console.log('POST /api/semesters/[id]/mata-kuliah - semesterId:', semesterId);

    const body = await request.json();
    console.log('Request body:', body);
    const { mataKuliahId, kelas, jadwal, tanggalJadwal, dosen, kuota, biaya, prasyarat } = body;

    // Validation
    if (!mataKuliahId || !kelas || !jadwal || !dosen || kuota === undefined || biaya === undefined) {
      console.error('Validation failed:', {
        mataKuliahId: !!mataKuliahId,
        kelas: !!kelas,
        jadwal: !!jadwal,
        dosen: !!dosen,
        kuota: kuota !== undefined,
        biaya: biaya !== undefined,
      });
      return NextResponse.json(
        { error: 'Mata kuliah, kelas, jadwal, dosen, kuota, dan biaya wajib diisi' },
        { status: 400 }
      );
    }

    // Check if semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      return NextResponse.json(
        { error: 'Semester tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if mata kuliah exists
    const mataKuliah = await prisma.mataKuliah.findUnique({
      where: { id: mataKuliahId },
    });

    if (!mataKuliah) {
      return NextResponse.json(
        { error: 'Mata kuliah tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if already assigned
    const existing = await prisma.semesterMataKuliah.findUnique({
      where: {
        semesterId_mataKuliahId_kelas: {
          semesterId,
          mataKuliahId,
          kelas,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Mata kuliah dengan kelas ini sudah diassign ke semester ini' },
        { status: 409 }
      );
    }

    // Create assignment
    console.log('Creating assignment with data:', {
      semesterId,
      mataKuliahId,
      kelas,
      jadwal,
      tanggalJadwal: tanggalJadwal ? new Date(tanggalJadwal) : null,
      dosen,
      kuota: parseInt(kuota),
      biaya: parseInt(biaya),
      prasyarat: prasyarat || null,
    });

    const newAssignment = await prisma.semesterMataKuliah.create({
      data: {
        semesterId,
        mataKuliahId,
        kelas,
        jadwal,
        tanggalJadwal: tanggalJadwal ? new Date(tanggalJadwal) : null,
        dosen,
        kuota: parseInt(kuota),
        terisi: 0,
        biaya: parseInt(biaya),
        prasyarat: prasyarat || null,
      },
      include: {
        mataKuliah: true,
      },
    });

    console.log('Assignment created successfully:', newAssignment.id);

    return NextResponse.json(
      {
        message: 'Mata kuliah berhasil diassign ke semester',
        semesterMataKuliah: newAssignment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Assign mata kuliah error:', error);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Mata kuliah dengan kelas ini sudah diassign ke semester ini' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengassign mata kuliah' },
      { status: 500 }
    );
  }
}

