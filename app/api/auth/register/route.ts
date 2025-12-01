import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const { nim, name, email, password } = body;

    // Validasi input
    if (!nim || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
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

    // Validasi panjang password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cek apakah NIM terdaftar di UserMaster
    const userMaster = await prisma.userMaster.findUnique({
      where: { nimOrNip: nim },
    });

    if (!userMaster) {
      return NextResponse.json(
        { error: 'NIM tidak terdaftar di sistem. Hubungi admin untuk mendaftarkan NIM Anda.' },
        { status: 404 }
      );
    }

    // Cek apakah user sudah memiliki account
    const existingAccount = await prisma.account.findUnique({
      where: { userMasterId: userMaster.id },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Akun dengan NIM ini sudah terdaftar. Silakan login atau gunakan lupa password.' },
        { status: 409 }
      );
    }

    // Update name di UserMaster jika name kosong/null (sama seperti email)
    // Name akan diisi oleh user saat self-register
    if (!userMaster.name || userMaster.name.trim() === '') {
      await prisma.userMaster.update({
        where: { id: userMaster.id },
        data: { name: name.trim() },
      });
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await prisma.account.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email sudah digunakan. Gunakan email lain atau lupa password.' },
        { status: 409 }
      );
    }

    // Cek status user (harus AKTIF)
    if (userMaster.status !== 'AKTIF') {
      return NextResponse.json(
        { error: 'Akun Anda tidak aktif. Hubungi admin untuk mengaktifkan akun.' },
        { status: 403 }
      );
    }

    // Cek role (hanya MAHASISWA yang bisa self-register)
    if (userMaster.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Hanya mahasiswa yang dapat mendaftar sendiri. Hubungi admin untuk akun dosen/admin.' },
        { status: 403 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Buat Account
    await prisma.account.create({
      data: {
        userMasterId: userMaster.id,
        email,
        passwordHash,
      },
    });

    // Fetch updated user data to get the latest name (jika sudah di-update)
    const updatedUserMaster = await prisma.userMaster.findUnique({
      where: { id: userMaster.id },
    });

    // Prepare user data
    const userData = {
      id: updatedUserMaster!.id,
      nim: updatedUserMaster!.nimOrNip,
      name: updatedUserMaster!.name || name.trim(), // Use updated name or fallback to registered name
      email,
      role: updatedUserMaster!.role,
      status: updatedUserMaster!.status,
    };

    // Set session cookie (auto-login setelah register)
    const response = NextResponse.json(
      {
        message: 'Pendaftaran berhasil!',
        user: userData,
      },
      { status: 201 }
    );

    // Set cookie manually
    const { shouldUseSecureCookie } = await import('@/lib/session');
    response.cookies.set('siakad_session', JSON.stringify(userData), {
      httpOnly: true,
      secure: shouldUseSecureCookie(),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    console.error('Error stack:', error?.stack);
    
    // Handle Prisma errors
    if (error?.code === 'P2002') {
      // Unique constraint violation
      const target = error?.meta?.target;
      if (target?.includes('email')) {
        return NextResponse.json(
          { error: 'Email sudah digunakan. Gunakan email lain atau lupa password.' },
          { status: 409 }
        );
      }
      if (target?.includes('userMasterId')) {
        return NextResponse.json(
          { error: 'Akun dengan NIM ini sudah terdaftar. Silakan login atau gunakan lupa password.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Data sudah terdaftar di sistem.' },
        { status: 409 }
      );
    }
    
    if (error?.code === 'P1001' || error?.code === 'P1017') {
      // Database connection error
      return NextResponse.json(
        { error: 'Tidak dapat terhubung ke database. Silakan coba lagi nanti.' },
        { status: 503 }
      );
    }
    
    // Handle other errors
    if (error instanceof Error) {
      // Database connection error
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Tidak dapat terhubung ke database. Silakan coba lagi nanti.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

