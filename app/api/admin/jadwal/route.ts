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
      kode: smk.mataKuliah.kode,
      nama: smk.mataKuliah.nama,
      kelas: smk.kelas,
      jadwal: smk.jadwal,
      tanggalJadwal: smk.tanggalJadwal,
      dosen: smk.dosen,
      sks: smk.mataKuliah.sks,
      kuota: smk.kuota,
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
