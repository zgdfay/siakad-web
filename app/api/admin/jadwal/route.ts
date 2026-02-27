import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get all jadwal master (SemesterMataKuliah) for admin/panitia
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PANITIA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isPublishedParam = searchParams.get('isPublished');
    const semesterId = searchParams.get('semesterId');
    const search = searchParams.get('search');

    const where: any = {};

    if (isPublishedParam && isPublishedParam !== 'all') {
      where.isPublished = isPublishedParam === 'true';
    }

    if (semesterId && semesterId !== 'all') {
      where.semesterId = semesterId;
    }

    if (search) {
      where.OR = [
        {
          mataKuliah: {
            nama: { contains: search, mode: 'insensitive' },
          },
        },
        {
          mataKuliah: {
            kode: { contains: search, mode: 'insensitive' },
          },
        },
        {
          dosen: { contains: search, mode: 'insensitive' },
        },
      ];
    }

    const semesterMataKuliahs = await prisma.semesterMataKuliah.findMany({
      where,
      include: {
        mataKuliah: true,
        semester: {
          select: {
            id: true,
            nama: true,
            tahun: true,
            periode: true,
          },
        },
        _count: {
          select: { pendaftaranDetail: true },
        },
      },
      orderBy: [
        { semester: { tahun: 'desc' } },
        { semester: { periode: 'desc' } },
        { mataKuliah: { kode: 'asc' } },
      ],
    });

    const jadwal = semesterMataKuliahs.map((smk: any) => ({
      id: smk.id,
      mataKuliahId: smk.mataKuliahId,
      kode: smk.mataKuliah.kode,
      nama: smk.mataKuliah.nama,
      kelas: smk.kelas,
      jadwal: smk.jadwal,
      tanggalJadwal: smk.tanggalJadwal,
      dosen: smk.dosen,
      sks: smk.mataKuliah.sks,
      kuota: smk.kuota,
      prasyarat: smk.prasyarat,
      terdaftar: smk._count.pendaftaranDetail,
      isPublished: smk.isPublished,
      semester: {
        id: smk.semester.id,
        nama: smk.semester.nama,
        tahun: smk.semester.tahun,
        periode: smk.semester.periode,
      },
    }));

    const total = jadwal.length;
    const published = jadwal.filter((j) => j.isPublished).length;
    const draft = total - published;

    return NextResponse.json({
      jadwal,
      stats: { total, published, draft },
    });
  } catch (error: any) {
    console.error('Get admin jadwal error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data jadwal' },
      { status: 500 }
    );
  }
}

// PATCH - Toggle isPublished status
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PANITIA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isPublished } = body;

    if (!id || typeof isPublished !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const updated = await prisma.semesterMataKuliah.update({
      where: { id },
      data: { isPublished },
    });

    return NextResponse.json({
      message: `Jadwal berhasil di-${isPublished ? 'publish' : 'unpublish'}`,
      jadwal: updated,
    });
  } catch (error: any) {
    console.error('Patch admin jadwal error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui status publikasi jadwal' },
      { status: 500 }
    );
  }
}

// POST - Create new jadwal (SemesterMataKuliah)
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PANITIA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      semesterId,
      mataKuliahId,
      kelas,
      jadwal,
      tanggalJadwal,
      dosen,
      kuota,
      prasyarat,
    } = body;

    // Validation
    if (!semesterId || !mataKuliahId || !kelas || !jadwal || !dosen || !kuota) {
      return NextResponse.json(
        { error: 'Semester, Mata Kuliah, Kelas, Jadwal, Dosen, dan Kuota wajib diisi' },
        { status: 400 }
      );
    }

    // Check for existing class in same semester and mata kuliah
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
        { error: 'Kelas untuk Mata Kuliah ini di Semester tersebut sudah ada' },
        { status: 409 }
      );
    }

    const dataCreation: any = {
      semesterId,
      mataKuliahId,
      kelas,
      jadwal,
      dosen,
      kuota: parseInt(kuota) || 30,
      terisi: 0,
      isPublished: true, // Auto publish on creation or according to requirements (set default)
    };

    if (tanggalJadwal) {
      dataCreation.tanggalJadwal = new Date(tanggalJadwal);
    }
    
    if (prasyarat) {
      dataCreation.prasyarat = prasyarat;
    }

    const newJadwal = await prisma.semesterMataKuliah.create({
      data: dataCreation,
    });

    return NextResponse.json(
      {
        message: 'Jadwal berhasil dibuat',
        jadwal: newJadwal,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create jadwal error:', error);
    
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Jadwal kelas sudah terdaftar' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat jadwal baru' },
      { status: 500 }
    );
  }
}

// PUT - Update existing jadwal (SemesterMataKuliah)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PANITIA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      semesterId,
      mataKuliahId,
      kelas,
      jadwal,
      tanggalJadwal,
      dosen,
      kuota,
      prasyarat,
    } = body;

    if (!id || !semesterId || !mataKuliahId || !kelas || !jadwal || !dosen || !kuota) {
      return NextResponse.json(
        { error: 'ID, Semester, Mata Kuliah, Kelas, Jadwal, Dosen, dan Kuota wajib diisi' },
        { status: 400 }
      );
    }

    const dataUpdate: any = {
      semesterId,
      mataKuliahId,
      kelas,
      jadwal,
      dosen,
      kuota: parseInt(kuota) || 30,
      tanggalJadwal: tanggalJadwal ? new Date(tanggalJadwal) : null,
      prasyarat: prasyarat || null,
    };

    const updatedJadwal = await prisma.semesterMataKuliah.update({
      where: { id },
      data: dataUpdate,
    });

    return NextResponse.json({
      message: 'Jadwal berhasil diperbarui',
      jadwal: updatedJadwal,
    });
  } catch (error: any) {
    console.error('Update jadwal error:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Kelas untuk Mata Kuliah ini di Semester tersebut sudah ada' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui jadwal' },
      { status: 500 }
    );
  }
}

// DELETE - Remove jadwal (SemesterMataKuliah)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'PANITIA')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID Jadwal wajib diisi' }, { status: 400 });
    }

    // Optional: Check if there are students already enrolled
    const checkEnrollment = await prisma.pendaftaranDetail.count({
      where: { semesterMataKuliahId: id }
    });

    if (checkEnrollment > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus jadwal karena sudah ada mahasiswa terdaftar' },
        { status: 400 }
      );
    }

    await prisma.semesterMataKuliah.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Jadwal berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete jadwal error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus jadwal' },
      { status: 500 }
    );
  }
}

