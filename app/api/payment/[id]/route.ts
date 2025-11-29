import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get payment by pendaftaran ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranId = resolvedParams.id;

    const payment = await prisma.payment.findUnique({
      where: { pendaftaranId },
      include: {
        pendaftaran: {
          include: {
            userMaster: {
              select: {
                id: true,
                nimOrNip: true,
                name: true,
              },
            },
            semester: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Data pembayaran tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error: any) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data pembayaran' },
      { status: 500 }
    );
  }
}

// PUT - Update payment status (admin only)
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

    // Only admin can update payment status
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengupdate status pembayaran.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranId = resolvedParams.id;

    const body = await request.json();
    const { status, catatan } = body;

    // Validate status
    const validStatuses = ['BELUM_BAYAR', 'MENUNGGU_VERIFIKASI', 'LUNAS', 'DITOLAK'];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { pendaftaranId },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Data pembayaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update payment
    const updateData: any = {};
    if (status) updateData.status = status.toUpperCase();
    if (catatan !== undefined) updateData.catatan = catatan || null;
    
    // Set tanggalBayar if status is LUNAS
    if (status?.toUpperCase() === 'LUNAS' && !existingPayment.tanggalBayar) {
      updateData.tanggalBayar = new Date();
    }

    const updatedPayment = await prisma.payment.update({
      where: { pendaftaranId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Status pembayaran berhasil diperbarui',
      payment: updatedPayment,
    });
  } catch (error: any) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate status pembayaran' },
      { status: 500 }
    );
  }
}

