import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nim = searchParams.get('nim');

    if (!nim || nim.trim().length < 3) {
      return NextResponse.json(
        { exists: false, message: 'NIM minimal 3 karakter' },
        { status: 400 }
      );
    }

    // Cek apakah NIM terdaftar di UserMaster
    const userMaster = await prisma.userMaster.findUnique({
      where: { nimOrNip: nim.trim() },
      select: {
        id: true,
        nimOrNip: true,
        name: true,
        role: true,
        status: true,
        account: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!userMaster) {
      return NextResponse.json(
        { exists: false, message: 'NIM tidak terdaftar di sistem' },
        { status: 200 }
      );
    }

    // Cek apakah sudah punya account
    if (userMaster.account) {
      return NextResponse.json(
        {
          exists: true,
          hasAccount: true,
          message: 'NIM terdaftar, namun akun sudah dibuat',
          user: {
            name: userMaster.name,
            role: userMaster.role,
            status: userMaster.status,
          },
        },
        { status: 200 }
      );
    }

    // Cek status
    if (userMaster.status !== 'AKTIF') {
      return NextResponse.json(
        {
          exists: true,
          hasAccount: false,
          isActive: false,
          message: 'NIM terdaftar, namun akun tidak aktif',
          user: {
            name: userMaster.name,
            role: userMaster.role,
            status: userMaster.status,
          },
        },
        { status: 200 }
      );
    }

    // Cek role
    if (userMaster.role !== 'MAHASISWA') {
      return NextResponse.json(
        {
          exists: true,
          hasAccount: false,
          isActive: true,
          canRegister: false,
          message: 'NIM terdaftar, namun hanya mahasiswa yang dapat mendaftar sendiri',
          user: {
            name: userMaster.name,
            role: userMaster.role,
            status: userMaster.status,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        exists: true,
        hasAccount: false,
        isActive: true,
        canRegister: true,
        message: 'NIM terdaftar dan dapat digunakan',
        user: {
          name: userMaster.name,
          role: userMaster.role,
          status: userMaster.status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Check NIM error:', error);
    return NextResponse.json(
      { exists: false, message: 'Terjadi kesalahan saat memeriksa NIM' },
      { status: 500 }
    );
  }
}

