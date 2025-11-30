import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getResetPasswordEmailTemplate } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validasi input
    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Cari Account by email
    const account = await prisma.account.findUnique({
      where: { email },
      include: { userMaster: true },
    });

    // Untuk keamanan, selalu return success meskipun email tidak ditemukan
    // Ini mencegah email enumeration attack
    if (!account) {
      return NextResponse.json(
        {
          message: 'Jika email terdaftar, link reset password telah dikirim ke email Anda.',
        },
        { status: 200 }
      );
    }

    // Cek status user
    if (account.userMaster.status !== 'AKTIF') {
      return NextResponse.json(
        {
          message: 'Jika email terdaftar, link reset password telah dikirim ke email Anda.',
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 24); // Token berlaku 24 jam

    // Update Account dengan reset token
    await prisma.account.update({
      where: { id: account.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Generate reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

    // Kirim email dengan template
    try {
      const emailHtml = getResetPasswordEmailTemplate(
        account.userMaster.name,
        resetLink
      );

      await sendEmail({
        to: email,
        subject: 'Reset Password - Siakad ITB YADIKA',
        html: emailHtml,
      });

      // Log untuk development
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Reset password email sent to:', email);
        console.log('🔗 Reset link:', resetLink);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Jangan throw error, tetap return success untuk keamanan
      // Tapi log error untuk debugging
    }

    return NextResponse.json(
      {
        message: 'Jika email terdaftar, link reset password telah dikirim ke email Anda.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

