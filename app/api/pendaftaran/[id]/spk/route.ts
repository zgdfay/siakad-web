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

    // Only allow download if pendaftaran is DITERIMA and payment is LUNAS
    if (pendaftaran.status !== 'DITERIMA') {
      return NextResponse.json(
        { error: 'SPK hanya dapat diunduh untuk pendaftaran yang telah diterima' },
        { status: 400 }
      );
    }

    if (!pendaftaran.payment || pendaftaran.payment.status !== 'LUNAS') {
      return NextResponse.json(
        { error: 'SPK hanya dapat diunduh setelah pembayaran lunas' },
        { status: 400 }
      );
    }

    // Generate SPK HTML content
    const spkHtml = generateSPKHTML(pendaftaran);

    // Return HTML as response (can be converted to PDF on client side or server side)
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
      padding: 40px;
      line-height: 1.6;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .header h2 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 12px;
    }
    .spk-title {
      text-align: center;
      margin: 30px 0;
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
    }
    .content {
      margin: 30px 0;
    }
    .info-section {
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-label {
      width: 200px;
      font-weight: normal;
    }
    .info-value {
      flex: 1;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .table th,
    .table td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    .table th {
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }
    .table td {
      text-align: left;
    }
    .table td:first-child,
    .table td:nth-child(3),
    .table td:nth-child(4) {
      text-align: center;
    }
    .signature-section {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .signature-box {
      width: 300px;
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 60px;
      padding-top: 5px;
    }
    .footer {
      margin-top: 30px;
      font-size: 11px;
      text-align: center;
      color: #666;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INSTITUT TEKNOLOGI DAN BISNIS</h1>
    <h2>YADIKA PASURUAN</h2>
    <p>Jl. Raya Warung Dowo No. 1, Pasuruan, Jawa Timur</p>
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

  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">
      Cetak / Simpan sebagai PDF
    </button>
  </div>
</body>
</html>
  `;
}

