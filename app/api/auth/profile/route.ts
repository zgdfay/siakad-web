import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Fetch user data from database
    const userData = await prisma.userMaster.findUnique({
      where: { id: user.id },
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

    return NextResponse.json({
      user: {
        id: userData.id,
        nim: userData.nimOrNip,
        name: userData.name,
        email: userData.account?.email || '',
        role: userData.role,
        status: userData.status,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data profil' },
      { status: 500 }
    );
  }
}

// PUT - Update current user profile
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
    const { name, email } = body;

    // Validate input
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama wajib diisi' },
        { status: 400 }
      );
    }

    if (name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nama minimal 3 karakter' },
        { status: 400 }
      );
    }

    if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Fetch existing user
    const existingUser = await prisma.userMaster.findUnique({
      where: { id: user.id },
      include: { account: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update name
    await prisma.userMaster.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
      },
    });

    // Update email if provided
    if (email !== undefined) {
      if (existingUser.account) {
        if (email && email.trim()) {
          // Update existing account email
          await prisma.account.update({
            where: { id: existingUser.account.id },
            data: { email: email.trim() },
          });
        }
      } else if (email && email.trim()) {
        // Create new account only if email is provided
        await prisma.account.create({
          data: {
            userMasterId: existingUser.id,
            email: email.trim(),
            passwordHash: '$2b$10$dummy.hash.for.new.user.that.needs.reset',
          },
        });
      }
    }

    // Fetch updated user
    const updatedUser = await prisma.userMaster.findUnique({
      where: { id: user.id },
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser!.id,
        nim: updatedUser!.nimOrNip,
        name: updatedUser!.name,
        email: updatedUser!.account?.email || '',
        role: updatedUser!.role,
        status: updatedUser!.status,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui profil' },
      { status: 500 }
    );
  }
}

