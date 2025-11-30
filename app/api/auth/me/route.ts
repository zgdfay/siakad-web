import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Fetch user data from database to get latest data (including updated name)
    const userData = await prisma.userMaster.findUnique({
      where: { id: sessionUser.id },
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Return latest user data from database
    const user = {
      id: userData.id,
      nim: userData.nimOrNip,
      name: userData.name,
      email: userData.account?.email || '',
      role: userData.role,
      status: userData.status,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
}

