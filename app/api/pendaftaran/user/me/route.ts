import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get current user's pendaftaran (mahasiswa)
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

    // Only mahasiswa can view their own pendaftaran
    if (user.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      userMasterId: user.id,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    const pendaftaran = await prisma.pendaftaran.findMany({
      where,
      include: {
        semester: true,
        detail: {
          include: {
            semesterMataKuliah: {
              include: {
                mataKuliah: true,
              },
            },
            nilai: true,
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
    console.error('Get user pendaftaran error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pendaftaran' },
      { status: 500 }
    );
  }
}

