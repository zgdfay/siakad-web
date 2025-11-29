import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST - Upload bukti pembayaran
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

    // Only mahasiswa can upload payment proof
    if (user.role !== 'MAHASISWA') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya mahasiswa yang dapat mengupload bukti pembayaran.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const pendaftaranId = formData.get('pendaftaranId') as string;
    const metodePembayaran = formData.get('metodePembayaran') as string;
    const file = formData.get('file') as File;

    if (!pendaftaranId || !metodePembayaran || !file) {
      return NextResponse.json(
        { error: 'Pendaftaran ID, metode pembayaran, dan file bukti wajib diisi' },
        { status: 400 }
      );
    }

    // Check if pendaftaran exists and belongs to user
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: { payment: true },
    });

    if (!pendaftaran) {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    if (pendaftaran.userMasterId !== user.id) {
      return NextResponse.json(
        { error: 'Akses ditolak. Pendaftaran ini bukan milik Anda.' },
        { status: 403 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau PDF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 5MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if not exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payment');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `payment_${pendaftaranId}_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save file URL (relative to public)
    const fileUrl = `/uploads/payment/${filename}`;

    // Update or create payment record
    const payment = await prisma.payment.upsert({
      where: { pendaftaranId },
      update: {
        metodePembayaran,
        buktiPembayaran: fileUrl,
        status: 'MENUNGGU_VERIFIKASI',
      },
      create: {
        pendaftaranId,
        jumlah: pendaftaran.totalBiaya,
        metodePembayaran,
        buktiPembayaran: fileUrl,
        status: 'MENUNGGU_VERIFIKASI',
      },
    });

    return NextResponse.json(
      {
        message: 'Bukti pembayaran berhasil diupload',
        payment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload payment proof error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupload bukti pembayaran' },
      { status: 500 }
    );
  }
}

