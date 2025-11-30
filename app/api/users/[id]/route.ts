import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Get user by ID
export async function GET(
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

    // Only admin can access
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const userData = await prisma.userMaster.findUnique({
      where: { id: resolvedParams.id },
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
        nimOrNip: userData.nimOrNip,
        name: userData.name,
        email: userData.account?.email || '',
        role: userData.role.toLowerCase(),
        status: userData.status.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
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

    // Only admin can update
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat mengupdate user.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nimOrNip, name, email, role, status } = body;

    // Get params (handle both Promise and direct object)
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = resolvedParams.id;

    // Check if user exists
    const existingUser = await prisma.userMaster.findUnique({
      where: { id: userId },
      include: { account: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate role
    if (role) {
      const validRoles = ['MAHASISWA', 'DOSEN', 'ADMIN'];
      if (!validRoles.includes(role.toUpperCase())) {
        return NextResponse.json(
          { error: 'Role tidak valid' },
          { status: 400 }
        );
      }
    }

    // Validate status
    if (status) {
      const validStatuses = ['AKTIF', 'NONAKTIF'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        );
      }
    }

    // Check if NIM/NIP already exists (if changed)
    if (nimOrNip && nimOrNip !== existingUser.nimOrNip) {
      const duplicateNim = await prisma.userMaster.findUnique({
        where: { nimOrNip },
      });

      if (duplicateNim) {
        return NextResponse.json(
          { error: 'NIM/NIP sudah terdaftar' },
          { status: 409 }
        );
      }
    }

    // Check if email already exists (if changed)
    // Email is optional - mahasiswa will fill it during self-register
    if (email !== undefined && email !== existingUser.account?.email) {
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
    }

    // Update user
    const updateData: any = {};
    if (nimOrNip) updateData.nimOrNip = nimOrNip;
    if (name !== undefined) updateData.name = name?.trim() || null;
    if (role) updateData.role = role.toUpperCase();
    if (status) updateData.status = status.toUpperCase();

    const updatedUser = await prisma.userMaster.update({
      where: { id: userId },
      data: updateData,
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
    });

    // Update email if provided
    // Email is optional - mahasiswa will fill it during self-register
    if (email !== undefined) {
      if (existingUser.account) {
        if (email && email.trim()) {
          // Update existing account email
          await prisma.account.update({
            where: { id: existingUser.account.id },
            data: { email: email.trim() },
          });
        }
        // If email is empty string, don't update (keep existing email)
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

    // Fetch updated user with account
    const finalUser = await prisma.userMaster.findUnique({
      where: { id: userId },
      include: {
        account: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'User berhasil diperbarui',
      user: {
        id: finalUser!.id,
        nimOrNip: finalUser!.nimOrNip,
        name: finalUser!.name,
        email: finalUser!.account?.email || '',
        role: finalUser!.role.toLowerCase(),
        status: finalUser!.status.toLowerCase(),
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);

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
      { error: 'Terjadi kesalahan saat mengupdate user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
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

    // Only admin can delete
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat menghapus user.' },
        { status: 403 }
      );
    }

    // Get params (handle both Promise and direct object)
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = resolvedParams.id;

    // Check if user exists
    const existingUser = await prisma.userMaster.findUnique({
      where: { id: userId },
      include: { account: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prevent deleting own account
    if (existingUser.id === user.id) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      );
    }

    // Delete using transaction to ensure consistency
    // Account has foreign key to UserMaster, so we need to delete it first
    await prisma.$transaction(async (tx) => {
      // Delete account first (if exists)
      if (existingUser.account) {
        await tx.account.delete({
          where: { id: existingUser.account.id },
        });
      }

      // Delete user
      await tx.userMaster.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json(
      { message: 'User berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });

    // Handle Prisma errors
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus user karena masih memiliki relasi dengan data lain' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Terjadi kesalahan saat menghapus user',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

