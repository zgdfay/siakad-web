import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validasi input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cari Account dengan reset token
    const account = await prisma.account.findUnique({
      where: { resetToken: token },
      include: { userMaster: true },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Token reset password tidak valid atau sudah kedaluwarsa.' },
        { status: 400 }
      );
    }

    // Cek apakah token sudah expired
    if (!account.resetTokenExpires || account.resetTokenExpires < new Date()) {
      return NextResponse.json(
        { error: 'Token reset password sudah kedaluwarsa. Silakan request reset password baru.' },
        { status: 400 }
      );
    }

    // Cek status user
    if (account.userMaster.status !== 'AKTIF') {
      return NextResponse.json(
        { error: 'Akun Anda tidak aktif. Hubungi admin untuk mengaktifkan akun.' },
        { status: 403 }
      );
    }

    // Hash password baru
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password dan hapus reset token
    await prisma.account.update({
      where: { id: account.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json(
      {
        message: 'Password berhasil direset. Silakan login dengan password baru.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mereset password. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

