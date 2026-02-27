import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - List payments for verification
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'KEUANGAN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const payments = await prisma.payment.findMany({
      where: status ? { status: status as any } : {},
      include: {
        pendaftaran: {
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
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update payment status (Verifikasi/Tolak)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'KEUANGAN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, status, pendaftaranId } = body;

    if (!paymentId || !status || !pendaftaranId) {
      return NextResponse.json({ error: 'Payment ID, Pendaftaran ID, and status required' }, { status: 400 });
    }

    if (!['LUNAS', 'DITOLAK'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }

    // Transaction for payment and pendaftaran status update based on business logic
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Payment status
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { 
          status: status,
          tanggalBayar: status === 'LUNAS' ? new Date() : undefined
        }
      });

      // 2. We deliberately DO NOT automatically update Pendaftaran to DITERIMA anymore
      // Keuangan's job is solely to verify the money. Panitia will verify the Pendaftaran separately.
      
      return updatedPayment;
    });

    return NextResponse.json({ message: `Status pembayaran berhasil diupdate`, payment: result });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
