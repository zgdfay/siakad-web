import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nim, password } = body;

    // Validasi input
    if (!nim || !password) {
      return NextResponse.json(
        { error: 'NIM dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Cari UserMaster by NIM
    const userMaster = await prisma.userMaster.findUnique({
      where: { nimOrNip: nim },
      include: { account: true },
    });

    if (!userMaster) {
      return NextResponse.json(
        { error: 'NIM atau password salah' },
        { status: 401 }
      );
    }

    // Cek apakah user memiliki account
    if (!userMaster.account) {
      return NextResponse.json(
        { error: 'Akun belum terdaftar. Silakan daftar terlebih dahulu.' },
        { status: 401 }
      );
    }

    // Cek status user
    if (userMaster.status !== 'AKTIF') {
      return NextResponse.json(
        { error: 'Akun Anda tidak aktif. Hubungi admin untuk mengaktifkan akun.' },
        { status: 403 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(
      password,
      userMaster.account.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'NIM atau password salah' },
        { status: 401 }
      );
    }

    // Prepare user data (tanpa password hash)
    const userData = {
      id: userMaster.id,
      nim: userMaster.nimOrNip,
      name: userMaster.name,
      email: userMaster.account.email,
      role: userMaster.role,
      status: userMaster.status,
    };

    // Set session cookie
    const response = NextResponse.json(
      {
        message: 'Login berhasil',
        user: userData,
      },
      { status: 200 }
    );

    // Set cookie manually karena setSession menggunakan cookies() yang async
    response.cookies.set('siakad_session', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

