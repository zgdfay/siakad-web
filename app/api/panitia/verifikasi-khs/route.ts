import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get list pendaftaran for KHS verification (PANITIA & ADMIN)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'PANITIA' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusKelayakan = searchParams.get('statusKelayakan');

    const pendaftaranList = await prisma.pendaftaran.findMany({
      where: statusKelayakan ? { statusKelayakan: statusKelayakan as any } : {},
      include: {
        userMaster: {
          select: {
            name: true,
            nimOrNip: true,
          }
        },
        semester: {
          select: {
            nama: true,
            tahun: true,
            periode: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ pendaftaran: pendaftaranList });
  } catch (error) {
    console.error('Error fetching pendaftaran for KHS verification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update status kelayakan KHS
export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'PANITIA' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pendaftaranId, statusKelayakan } = body;

    if (!pendaftaranId || !statusKelayakan) {
      return NextResponse.json({ error: 'Pendaftaran ID and statusKelayakan required' }, { status: 400 });
    }

    if (!['LAYAK', 'TIDAK_LAYAK', 'BELUM_DIPROSES'].includes(statusKelayakan)) {
      return NextResponse.json({ error: 'Invalid status kelayakan' }, { status: 400 });
    }

    const updated = await prisma.pendaftaran.update({
      where: { id: pendaftaranId },
      data: { statusKelayakan }
    });

    return NextResponse.json({ message: 'Status kelayakan berhasil diperbarui', pendaftaran: updated });
  } catch (error) {
    console.error('Error updating status kelayakan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
