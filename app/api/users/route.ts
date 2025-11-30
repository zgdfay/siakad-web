import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get all users
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Only admin can access
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengakses.' },
        { status: 403 }
      );
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { nimOrNip: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role !== 'all') {
      where.role = role.toUpperCase();
    }

    // Fetch users with account
    const users = await prisma.userMaster.findMany({
      where,
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      nimOrNip: user.nimOrNip,
      name: user.name,
      email: user.account?.email || '',
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Only admin can create
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat membuat user.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nimOrNip, name, email, role, status } = body;

    // Validation
    if (!nimOrNip || !role) {
      return NextResponse.json(
        { error: 'NIM/NIP dan role wajib diisi' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['MAHASISWA', 'DOSEN', 'ADMIN'];
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['AKTIF', 'NONAKTIF'];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }

    // Check if NIM/NIP already exists
    const existingUser = await prisma.userMaster.findUnique({
      where: { nimOrNip },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'NIM/NIP sudah terdaftar' },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    // Email is optional - mahasiswa will fill it during self-register
    if (email && email.trim()) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Format email tidak valid' },
          { status: 400 }
        );
      }

      const existingEmail = await prisma.account.findUnique({
        where: { email: email.trim() },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 409 }
        );
      }
    }

    // Create user
    const newUser = await prisma.userMaster.create({
      data: {
        nimOrNip,
        name: name?.trim() || null,
        role: role.toUpperCase() as 'MAHASISWA' | 'DOSEN' | 'ADMIN',
        status: (status?.toUpperCase() || 'AKTIF') as 'AKTIF' | 'NONAKTIF',
        ...(email && email.trim() && {
          account: {
            create: {
              email: email.trim(),
              // Generate random password hash (user harus reset password)
              passwordHash: '$2b$10$dummy.hash.for.new.user.that.needs.reset',
            },
          },
        }),
      },
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'User berhasil dibuat',
        user: {
          id: newUser.id,
          nimOrNip: newUser.nimOrNip,
          name: newUser.name,
          email: newUser.account?.email || '',
          role: newUser.role.toLowerCase(),
          status: newUser.status.toLowerCase(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create user error:', error);

    // Handle Prisma errors
    if (error?.code === 'P2002') {
      const target = error?.meta?.target;
      if (target?.includes('nimOrNip')) {
        return NextResponse.json(
          { error: 'NIM/NIP sudah terdaftar' },
          { status: 409 }
        );
      }
      if (target?.includes('email')) {
        return NextResponse.json(
          { error: 'Email sudah digunakan' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat user' },
      { status: 500 }
    );
  }
}

