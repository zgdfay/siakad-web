import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getCloudinary } from '@/lib/cloudinary';

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
    const filename = `payment_${pendaftaranId}_${timestamp}`;
    const folder = `payment-proofs/${pendaftaranId}`;

    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Convert buffer to base64 string for Cloudinary
      const base64String = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64String}`;

      // Get Cloudinary instance
      const cloudinary = getCloudinary();

      // Upload file to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataUri,
          {
            folder: folder,
            public_id: filename,
            resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
            format: fileExtension,
            overwrite: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      }) as any;

      if (!uploadResult?.secure_url) {
        throw new Error('File URL tidak ditemukan setelah upload');
      }

      const fileUrl = uploadResult.secure_url;
      const publicId = uploadResult.public_id;

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
        // If database update fails, delete the file from Cloudinary
        try {
          await getCloudinary().uploader.destroy(publicId);
          console.log('File deleted from Cloudinary due to database update failure');
        } catch (deleteError) {
          console.error('Error deleting file from Cloudinary after database update failure:', deleteError);
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

