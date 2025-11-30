import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Generate and download SPK (Surat Perintah Kuliah)
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

    const resolvedParams = params instanceof Promise ? await params : params;
    const pendaftaranId = resolvedParams.id;

    // Fetch pendaftaran with all relations
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        userMaster: {
          select: {
            id: true,
            nimOrNip: true,
            name: true,
          },
        },
        semester: true,
        detail: {
          include: {
            semesterMataKuliah: {
              include: {
                mataKuliah: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!pendaftaran) {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check access: mahasiswa can only access their own, admin can access all
    if (user.role === 'MAHASISWA' && pendaftaran.userMasterId !== user.id) {
      return NextResponse.json(
        { error: 'Akses ditolak' },
        { status: 403 }
      );
    }

    // Only allow download if pendaftaran is DITERIMA
    // Jika status DITERIMA, payment otomatis menjadi LUNAS saat admin menerima
    if (pendaftaran.status !== 'DITERIMA') {
      return NextResponse.json(
        { error: 'SPK hanya dapat diunduh untuk pendaftaran yang telah diterima' },
        { status: 400 }
      );
    }

    // Cek payment status (case-insensitive)
    // Jika status pendaftaran DITERIMA tapi payment belum LUNAS, update payment status
    if (pendaftaran.payment) {
      const paymentStatus = pendaftaran.payment.status?.toUpperCase();
      if (paymentStatus !== 'LUNAS') {
        // Update payment status to LUNAS if pendaftaran is DITERIMA
        await prisma.payment.update({
          where: { pendaftaranId: pendaftaran.id },
          data: {
            status: 'LUNAS',
            tanggalBayar: pendaftaran.payment.tanggalBayar || new Date(),
          },
        });
        // Re-fetch payment after update
        pendaftaran.payment = await prisma.payment.findUnique({
          where: { pendaftaranId: pendaftaran.id },
        });
      }
    } else {
      // If no payment record exists but pendaftaran is DITERIMA, create payment record
      const createdPayment = await prisma.payment.create({
        data: {
          pendaftaranId: pendaftaran.id,
          jumlah: pendaftaran.totalBiaya,
          status: 'LUNAS',
          tanggalBayar: new Date(),
        },
      });
      pendaftaran.payment = createdPayment;
    }

    // Generate SPK HTML content
    const spkHtml = generateSPKHTML(pendaftaran);

    // Return HTML with auto-print script for PDF download
    return new NextResponse(spkHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="SPK_${pendaftaran.userMaster.nimOrNip}_${pendaftaran.semester.nama.replace(/\s+/g, '_')}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Generate SPK error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghasilkan SPK' },
      { status: 500 }
    );
  }
}

function generateSPKHTML(pendaftaran: any) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPK - ${pendaftaran.userMaster.nimOrNip}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', serif;
      padding: 50px 60px;
      line-height: 1.8;
      color: #000;
      background: #fff;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 35px;
      border-bottom: 3px solid #000;
      padding-bottom: 25px;
    }
    .header h1 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header h2 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 13px;
      margin: 4px 0;
    }
    .spk-title {
      text-align: center;
      margin: 35px 0;
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
      letter-spacing: 1px;
    }
    .content {
      margin: 35px 0;
    }
    .info-section {
      margin-bottom: 25px;
    }
    .info-section p {
      margin-bottom: 12px;
      font-size: 13px;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
      line-height: 1.8;
      font-size: 13px;
    }
    .info-label {
      width: 220px;
      font-weight: normal;
      flex-shrink: 0;
    }
    .info-value {
      flex: 1;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 12px;
    }
    .table th,
    .table td {
      border: 1px solid #000;
      padding: 10px 8px;
      text-align: left;
    }
    .table th {
      background-color: #f5f5f5;
      font-weight: bold;
      text-align: center;
    }
    .table td {
      text-align: left;
      vertical-align: top;
    }
    .table td:first-child,
    .table td:nth-child(4) {
      text-align: center;
    }
    .table td:nth-child(3) {
      text-align: center;
    }
    .signature-section {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 320px;
      text-align: center;
    }
    .signature-box p {
      margin-bottom: 5px;
      font-size: 13px;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 70px;
      padding-top: 8px;
      width: 100%;
    }
    .footer {
      margin-top: 40px;
      font-size: 11px;
      text-align: center;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    @media print {
      body {
        padding: 15mm 20mm;
        margin: 0;
      }
      .no-print {
        display: none;
      }
      @page {
        margin: 0;
        size: A4;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INSTITUT TEKNOLOGI DAN BISNIS</h1>
    <h2>YADIKA PASURUAN</h2>
    <p>Jl. Salem No.3, Kersikan, Kec. Bangil, Pasuruan, Jawa Timur 67153</p>
    <p>Telp: (0343) 421-123 | Email: info@itb-yadika.ac.id</p>
  </div>

  <div class="spk-title">
    Surat Perintah Kuliah (SPK)
  </div>

  <div class="content">
    <div class="info-section">
      <div class="info-row">
        <div class="info-label">Nomor SPK:</div>
        <div class="info-value">SPK/${pendaftaran.id.substring(0, 8).toUpperCase()}/${new Date().getFullYear()}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Tanggal:</div>
        <div class="info-value">${formatDate(new Date())}</div>
      </div>
    </div>

    <div class="info-section">
      <p style="margin-bottom: 10px; font-weight: bold;">Data Mahasiswa:</p>
      <div class="info-row">
        <div class="info-label">NIM:</div>
        <div class="info-value">${pendaftaran.userMaster.nimOrNip}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Nama:</div>
        <div class="info-value">${pendaftaran.userMaster.name}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Semester Antara:</div>
        <div class="info-value">${pendaftaran.semester.nama} (${pendaftaran.semester.tahun} - ${pendaftaran.semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap'})</div>
      </div>
    </div>

    <div class="info-section">
      <p style="margin-bottom: 10px; font-weight: bold;">Mata Kuliah yang Diambil:</p>
      <table class="table">
        <thead>
          <tr>
            <th>No</th>
            <th>Kode</th>
            <th>Nama Mata Kuliah</th>
            <th>SKS</th>
            <th>Kelas</th>
            <th>Jadwal</th>
            <th>Dosen</th>
          </tr>
        </thead>
        <tbody>
          ${pendaftaran.detail.map((detail: any, index: number) => {
            const smk = detail.semesterMataKuliah;
            return `
            <tr>
              <td>${index + 1}</td>
              <td>${smk.mataKuliah.kode}</td>
              <td>${smk.mataKuliah.nama}</td>
              <td>${smk.mataKuliah.sks}</td>
              <td>${smk.kelas}</td>
              <td>${smk.jadwal}</td>
              <td>${smk.dosen}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="info-section">
      <div class="info-row">
        <div class="info-label">Total SKS:</div>
        <div class="info-value"><strong>${pendaftaran.totalSKS} SKS</strong></div>
      </div>
      <div class="info-row">
        <div class="info-label">Total Biaya:</div>
        <div class="info-value"><strong>${formatCurrency(pendaftaran.totalBiaya)}</strong></div>
      </div>
      ${pendaftaran.payment ? `
      <div class="info-row">
        <div class="info-label">Status Pembayaran:</div>
        <div class="info-value"><strong>LUNAS</strong></div>
      </div>
      ${pendaftaran.payment.tanggalBayar ? `
      <div class="info-row">
        <div class="info-label">Tanggal Pembayaran:</div>
        <div class="info-value">${formatDate(pendaftaran.payment.tanggalBayar)}</div>
      </div>
      ` : ''}
      ` : ''}
    </div>

    <div class="info-section">
      <p style="margin-top: 20px; text-align: justify;">
        Dengan ini mahasiswa di atas diizinkan untuk mengikuti perkuliahan pada semester antara yang telah ditentukan. 
        SPK ini berlaku selama periode semester antara berlangsung.
      </p>
    </div>
  </div>

  <div class="signature-section">
    <div class="signature-box">
      <p>Mengetahui,</p>
      <p>Kepala Bagian Akademik</p>
      <div class="signature-line"></div>
      <p style="margin-top: 5px;">(___________________)</p>
    </div>
    <div class="signature-box">
      <p>Pasuruan, ${formatDate(new Date())}</p>
      <p>Ketua Program Studi</p>
      <div class="signature-line"></div>
      <p style="margin-top: 5px;">(___________________)</p>
    </div>
  </div>

  <div class="footer">
    <p>Dokumen ini dicetak secara otomatis dari sistem SIAKAD ITB YADIKA PASURUAN</p>
    <p>Dokumen ini sah dan dapat digunakan untuk keperluan akademik</p>
  </div>

  <script>
    // Auto-trigger print dialog when page loads for PDF download
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;
}

