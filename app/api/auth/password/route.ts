import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT - Update current user password
export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password saat ini dan password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Fetch user account
    const userData = await prisma.userMaster.findUnique({
      where: { id: user.id },
      include: { account: true },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!userData.account) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan. Silakan hubungi admin.' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userData.account.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password saat ini tidak sesuai' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.account.update({
      where: { id: userData.account.id },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({
      message: 'Password berhasil diubah',
    });
  } catch (error: any) {
    console.error('Update password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah password' },
      { status: 500 }
    );
  }
}

