import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { sendEmail } from '@/lib/email';
import { getPendaftaranDiterimaEmailTemplate } from '@/lib/email-templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Send email notification manually (admin only)
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

    // Only admin can send email
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengirim email.' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranId = resolvedParams.id;

    // Fetch pendaftaran with all relations
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

    // Only send email if status is DITERIMA
    if (pendaftaran.status !== 'DITERIMA') {
      return NextResponse.json(
        { error: 'Email hanya dapat dikirim untuk pendaftaran yang telah diterima' },
        { status: 400 }
      );
    }

    const userEmail = pendaftaran.userMaster.account?.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email user tidak ditemukan' },
        { status: 400 }
      );
    }

    const userName = pendaftaran.userMaster.name || pendaftaran.userMaster.nimOrNip;
    const semesterNama = pendaftaran.semester.nama;

    // Generate URLs for SPK and Invoice
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const spkUrl = `${baseUrl}/api/pendaftaran/${pendaftaranId}/spk`;
    const invoiceUrl = `${baseUrl}/api/pendaftaran/${pendaftaranId}/invoice`;

    // Generate email template
    const emailHtml = getPendaftaranDiterimaEmailTemplate(
      userName,
      semesterNama,
      spkUrl,
      invoiceUrl
    );

    // Send email
    await sendEmail({
      to: userEmail,
      subject: `Pendaftaran Diterima - ${semesterNama} | Siakad ITB YADIKA`,
      html: emailHtml,
    });

    return NextResponse.json({
      message: 'Email berhasil dikirim',
    });
  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat mengirim email' },
      { status: 500 }
    );
  }
}

