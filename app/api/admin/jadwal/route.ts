import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get all jadwal for admin monitoring
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Only admin can access
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Akses ditolak. Hanya admin yang dapat mengakses halaman ini.',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusJadwal = searchParams.get('statusJadwal');
    const semesterId = searchParams.get('semesterId');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      pendaftaran: {
        status: 'DITERIMA',
      },
    };

    if (statusJadwal && statusJadwal !== 'all') {
      where.statusJadwal = statusJadwal;
    }

    if (semesterId && semesterId !== 'all') {
      where.pendaftaran = {
        ...where.pendaftaran,
        semesterId,
      };
    }

    if (search) {
      where.OR = [
        {
          semesterMataKuliah: {
            mataKuliah: {
              nama: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          semesterMataKuliah: {
            mataKuliah: {
              kode: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          pendaftaran: {
            userMaster: {
              nimOrNip: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          pendaftaran: {
            userMaster: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    // Fetch all jadwal
    const pendaftaranDetails = await prisma.pendaftaranDetail.findMany({
      where,
      include: {
        semesterMataKuliah: {
          include: {
            mataKuliah: true,
          },
        },
        pendaftaran: {
          include: {
            userMaster: {
              select: {
                nimOrNip: true,
                name: true,
              },
            },
            semester: {
              select: {
                nama: true,
                tahun: true,
                periode: true,
              },
            },
          },
        },
      },
      orderBy: [
        { pendaftaran: { semester: { tahun: 'desc' } } },
        { pendaftaran: { semester: { periode: 'desc' } } },
        { semesterMataKuliah: { mataKuliah: { kode: 'asc' } } },
      ],
    });

    // Transform data
    const jadwal = pendaftaranDetails.map(
      (detail: (typeof pendaftaranDetails)[0]) => ({
        id: detail.semesterMataKuliah.id,
        pendaftaranDetailId: detail.id,
        kode: detail.semesterMataKuliah.mataKuliah.kode,
        nama: detail.semesterMataKuliah.mataKuliah.nama,
        kelas: detail.semesterMataKuliah.kelas,
        jadwal: detail.semesterMataKuliah.jadwal,
        tanggalJadwal: detail.semesterMataKuliah.tanggalJadwal,
        dosen: detail.semesterMataKuliah.dosen,
        sks: detail.semesterMataKuliah.mataKuliah.sks,
        statusJadwal: detail.statusJadwal,
        mahasiswa: {
          nimOrNip: detail.pendaftaran.userMaster.nimOrNip,
          name: detail.pendaftaran.userMaster.name,
        },
        semester: {
          nama: detail.pendaftaran.semester.nama,
          tahun: detail.pendaftaran.semester.tahun,
          periode: detail.pendaftaran.semester.periode,
        },
      })
    );

    // Calculate stats
    const total = jadwal.length;
    const aktif = jadwal.filter(
      (j: (typeof jadwal)[0]) => j.statusJadwal === 'AKTIF'
    ).length;
    const selesai = jadwal.filter(
      (j: (typeof jadwal)[0]) => j.statusJadwal === 'SELESAI'
    ).length;

    return NextResponse.json({
      jadwal,
      stats: {
        total,
        aktif,
        selesai,
      },
    });
  } catch (error: any) {
    console.error('Get admin jadwal error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data jadwal' },
      { status: 500 }
    );
  }
}
