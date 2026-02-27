import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get all pendaftaran (admin only)
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

    // Only admin and panitia can view all pendaftaran
    if (user.role !== 'ADMIN' && user.role !== 'PANITIA') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const semesterId = searchParams.get('semesterId');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (semesterId) {
      where.semesterId = semesterId;
    }
    if (search) {
      where.OR = [
        {
          userMaster: {
            nimOrNip: { contains: search, mode: 'insensitive' },
          },
        },
        {
          userMaster: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    const pendaftaran = await prisma.pendaftaran.findMany({
      where,
      include: {
        userMaster: {
          select: {
            id: true,
            nimOrNip: true,
            name: true,
          },
        },
        semester: true,
        detail: {
          include: {
            semesterMataKuliah: {
              include: {
                mataKuliah: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ pendaftaran });
  } catch (error: any) {
    console.error('Get pendaftaran error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pendaftaran' },
      { status: 500 }
    );
  }
}

// POST - Submit new pendaftaran (mahasiswa)
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

    // Only mahasiswa can submit pendaftaran
    if (user.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya mahasiswa yang dapat mendaftar.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { semesterId, mataKuliahIds } = body; // Array of semesterMataKuliahId

    // Validation
    if (!semesterId || !mataKuliahIds || !Array.isArray(mataKuliahIds) || mataKuliahIds.length === 0) {
      return NextResponse.json(
        { error: 'Semester dan mata kuliah wajib diisi' },
        { status: 400 }
      );
    }

    // Check if semester exists and is active
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: {
        mataKuliah: {
          where: {
            id: { in: mataKuliahIds },
          },
          include: {
            mataKuliah: true,
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

    if (semester.status !== 'AKTIF') {
      return NextResponse.json(
        { error: 'Semester tidak aktif' },
        { status: 400 }
      );
    }

    // Check deadline
    if (new Date() > semester.deadlinePendaftaran) {
      return NextResponse.json(
        { error: 'Deadline pendaftaran sudah lewat' },
        { status: 400 }
      );
    }

    // Check if all mata kuliah exist and are available
    if (semester.mataKuliah.length !== mataKuliahIds.length) {
      return NextResponse.json(
        { error: 'Beberapa mata kuliah tidak ditemukan di semester ini' },
        { status: 404 }
      );
    }

    // Check quota for each mata kuliah
    for (const smk of semester.mataKuliah) {
      if (smk.terisi >= smk.kuota) {
        return NextResponse.json(
          { error: `Mata kuliah ${smk.mataKuliah.nama} (${smk.kelas}) sudah penuh` },
          { status: 400 }
        );
      }
    }

    // Check if user already has pending/accepted pendaftaran for this semester
    // Only block if there's an active pendaftaran with DITERIMA status AND same mata kuliah
    // Allow new pendaftaran if mata kuliah berbeda (untuk menambah mata kuliah baru)
    const existingAcceptedPendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        userMasterId: user.id,
        semesterId,
        status: 'DITERIMA',
      },
      include: {
        detail: {
          include: {
            semesterMataKuliah: {
              include: {
                mataKuliah: {
                  select: {
                    nama: true,
                    kode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (existingAcceptedPendaftaran) {
      // Cek apakah ada overlap mata kuliah yang sama
      const existingMataKuliahIds = existingAcceptedPendaftaran.detail.map(
        (d) => d.semesterMataKuliahId
      );
      const overlappingIds = mataKuliahIds.filter((id) =>
        existingMataKuliahIds.includes(id)
      );

      if (overlappingIds.length > 0) {
        // Ambil nama mata kuliah yang overlap dari existing pendaftaran
        const overlappingMataKuliah = existingAcceptedPendaftaran.detail
          .filter((d) => overlappingIds.includes(d.semesterMataKuliahId))
          .map(
            (d) =>
              `${d.semesterMataKuliah.mataKuliah.nama} (${d.semesterMataKuliah.mataKuliah.kode}) - Kelas ${d.semesterMataKuliah.kelas}`
          )
          .join(', ');

        return NextResponse.json(
          {
            error:
              'Anda sudah memiliki pendaftaran yang diterima untuk mata kuliah berikut',
            overlappingMataKuliah,
            detail: `Mata kuliah yang sudah terdaftar: ${overlappingMataKuliah}. Silakan pilih mata kuliah lain atau hubungi admin jika ingin mengubah pendaftaran yang sudah diterima.`,
          },
          { status: 409 }
        );
      }
      // Jika tidak ada overlap, izinkan pendaftaran baru (untuk menambah mata kuliah)
    }

    // If there's a pending pendaftaran, cancel it and allow new pendaftaran
    // This allows user to change their mata kuliah selection before verification
    const existingPendingPendaftaran = await prisma.pendaftaran.findFirst({
      where: {
        userMasterId: user.id,
        semesterId,
        status: 'MENUNGGU_VERIFIKASI',
      },
      include: {
        detail: true,
      },
    });

    if (existingPendingPendaftaran) {
      // Cancel the old pendaftaran and revert quota
      await prisma.$transaction(async (tx) => {
        // Revert terisi count for old mata kuliah
        for (const detail of existingPendingPendaftaran.detail) {
          await tx.semesterMataKuliah.update({
            where: { id: detail.semesterMataKuliahId },
            data: {
              terisi: {
                decrement: 1,
              },
            },
          });
        }

        // Cancel the old pendaftaran
        await tx.pendaftaran.update({
          where: { id: existingPendingPendaftaran.id },
          data: {
            status: 'DIBATALKAN',
            catatan: 'Dibatalkan otomatis karena pendaftaran baru dibuat',
          },
        });
      });
    }

    // Calculate total SKS and biaya
    let totalSKS = 0;
    let totalBiaya = 0;
    for (const smk of semester.mataKuliah) {
      totalSKS += smk.mataKuliah.sks;
      totalBiaya += smk.biaya;
    }

    // Create pendaftaran with details in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create pendaftaran
      const pendaftaran = await tx.pendaftaran.create({
        data: {
          userMasterId: user.id,
          semesterId,
          totalSKS,
          totalBiaya,
          status: 'MENUNGGU_VERIFIKASI',
        },
      });

      // Create pendaftaran details
      await tx.pendaftaranDetail.createMany({
        data: mataKuliahIds.map((smkId: string) => ({
          pendaftaranId: pendaftaran.id,
          semesterMataKuliahId: smkId,
        })),
      });

      // Create payment record
      await tx.payment.create({
        data: {
          pendaftaranId: pendaftaran.id,
          jumlah: totalBiaya,
          status: 'BELUM_BAYAR',
        },
      });

      // Update terisi count for each mata kuliah
      for (const smkId of mataKuliahIds) {
        await tx.semesterMataKuliah.update({
          where: { id: smkId },
          data: {
            terisi: {
              increment: 1,
            },
          },
        });
      }

      // Fetch complete pendaftaran data
      return await tx.pendaftaran.findUnique({
        where: { id: pendaftaran.id },
        include: {
          userMaster: {
            select: {
              id: true,
              nimOrNip: true,
              name: true,
            },
          },
          semester: true,
          detail: {
            include: {
              semesterMataKuliah: {
                include: {
                  mataKuliah: true,
                },
              },
            },
          },
          payment: true,
        },
      });
    });

    return NextResponse.json(
      {
        message: 'Pendaftaran berhasil dibuat',
        pendaftaran: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create pendaftaran error:', error);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Pendaftaran sudah ada' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat pendaftaran' },
      { status: 500 }
    );
  }
}

