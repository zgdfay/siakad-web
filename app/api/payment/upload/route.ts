import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getSupabaseClient, STORAGE_BUCKET } from '@/lib/supabase';

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

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `payment_${pendaftaranId}_${timestamp}.${fileExtension}`;
    const filePath = `${pendaftaranId}/${filename}`;

    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Get Supabase client
      const supabase = getSupabaseClient();

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false, // Don't overwrite existing files
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(
          uploadError.message || 'Gagal mengupload file ke storage'
        );
      }

      if (!uploadData?.path) {
        throw new Error('File path tidak ditemukan setelah upload');
      }

      // Get public URL
      const { data: urlData } = getSupabaseClient().storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

      const fileUrl = urlData.publicUrl;

      // Only update database if file was successfully uploaded
      try {
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
      } catch (dbError: any) {
        // If database update fails, delete the file from storage
        try {
          await getSupabaseClient().storage.from(STORAGE_BUCKET).remove([uploadData.path]);
          console.log('File deleted from storage due to database update failure');
        } catch (deleteError) {
          console.error('Error deleting file from storage after database update failure:', deleteError);
        }
        throw dbError;
      }
    } catch (uploadError: any) {
      // Re-throw to be caught by outer catch block
      throw uploadError;
    }
  } catch (error: any) {
    console.error('Upload payment proof error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Terjadi kesalahan saat mengupload bukti pembayaran';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.code === 'EACCES' || error.code === 'EPERM') {
      errorMessage = 'Tidak memiliki izin untuk menulis file. Hubungi administrator.';
    } else if (error.code === 'ENOSPC') {
      errorMessage = 'Ruang penyimpanan penuh. Hubungi administrator.';
    } else if (error.code === 'ENOENT') {
      errorMessage = 'Direktori upload tidak ditemukan. Hubungi administrator.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

