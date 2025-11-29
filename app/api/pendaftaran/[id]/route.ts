import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get pendaftaran by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranId = resolvedParams.id;

    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        userMaster: {
          select: {
            id: true,
            nimOrNip: true,
            name: true,
            account: {
              select: {
                email: true,
              },
            },
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

    if (!pendaftaran) {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check access: mahasiswa can only see their own, admin can see all
    if (user.role !== 'ADMIN' && pendaftaran.userMasterId !== user.id) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    return NextResponse.json({ pendaftaran });
  } catch (error: any) {
    console.error('Get pendaftaran error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pendaftaran' },
      { status: 500 }
    );
  }
}

// PUT - Update pendaftaran (verifikasi by admin)
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

    // Only admin can verify
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat memverifikasi pendaftaran.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranId = resolvedParams.id;

    const body = await request.json();
    const { status, catatanAdmin } = body;

    // Validation
    if (!status) {
      return NextResponse.json(
        { error: 'Status wajib diisi' },
        { status: 400 }
      );
    }

    const validStatuses = ['MENUNGGU_VERIFIKASI', 'DITERIMA', 'DITOLAK', 'DIBATALKAN'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Check if pendaftaran exists
    const existingPendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        detail: {
          include: {
            semesterMataKuliah: true,
          },
        },
      },
    });

    if (!existingPendaftaran) {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    const newStatus = status.toUpperCase() as 'MENUNGGU_VERIFIKASI' | 'DITERIMA' | 'DITOLAK' | 'DIBATALKAN';

    // If rejecting, need to free up quota
    if (newStatus === 'DITOLAK' && existingPendaftaran.status === 'MENUNGGU_VERIFIKASI') {
      await prisma.$transaction(async (tx) => {
        // Update status
        await tx.pendaftaran.update({
          where: { id: pendaftaranId },
          data: {
            status: newStatus,
            catatanAdmin: catatanAdmin || null,
          },
        });

        // Decrease terisi count
        for (const detail of existingPendaftaran.detail) {
          await tx.semesterMataKuliah.update({
            where: { id: detail.semesterMataKuliahId },
            data: {
              terisi: {
                decrement: 1,
              },
            },
          });
        }
      });
    } else {
      // Just update status
      await prisma.pendaftaran.update({
        where: { id: pendaftaranId },
        data: {
          status: newStatus,
          catatanAdmin: catatanAdmin || null,
        },
      });
    }

    // Fetch updated pendaftaran
    const updatedPendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
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

    return NextResponse.json({
      message: 'Pendaftaran berhasil diperbarui',
      pendaftaran: updatedPendaftaran,
    });
  } catch (error: any) {
    console.error('Update pendaftaran error:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate pendaftaran' },
      { status: 500 }
    );
  }
}

// DELETE - Delete pendaftaran (admin only)
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
        { error: 'Akses ditolak. Hanya admin yang dapat menghapus pendaftaran.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranId = resolvedParams.id;

    // Check if pendaftaran exists
    const existingPendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        detail: {
          include: {
            semesterMataKuliah: true,
          },
        },
      },
    });

    if (!existingPendaftaran) {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete pendaftaran and revert quota in transaction
    await prisma.$transaction(async (tx) => {
      // Revert terisi count if status is MENUNGGU_VERIFIKASI or DITERIMA
      if (
        existingPendaftaran.status === 'MENUNGGU_VERIFIKASI' ||
        existingPendaftaran.status === 'DITERIMA'
      ) {
        for (const detail of existingPendaftaran.detail) {
          await tx.semesterMataKuliah.update({
            where: { id: detail.semesterMataKuliahId },
            data: {
              terisi: {
                decrement: 1,
              },
            },
          });
        }
      }

      // Delete payment if exists (cascade will handle it, but explicit delete is safer)
      const payment = await tx.payment.findUnique({
        where: { pendaftaranId },
      });
      
      if (payment) {
        await tx.payment.delete({
          where: { pendaftaranId },
        });
      }

      // Delete pendaftaran (cascade will delete details)
      await tx.pendaftaran.delete({
        where: { id: pendaftaranId },
      });
    });

    return NextResponse.json({
      message: 'Pendaftaran berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete pendaftaran error:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus pendaftaran' },
      { status: 500 }
    );
  }
}

