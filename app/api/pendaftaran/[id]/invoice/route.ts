import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Generate and download Invoice
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

    // Generate Invoice HTML content
    const invoiceHtml = generateInvoiceHTML(pendaftaran);

    // Return HTML as response
    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Invoice_${pendaftaran.userMaster.nimOrNip}_${pendaftaran.semester.nama.replace(/\s+/g, '_')}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Generate Invoice error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghasilkan Invoice' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(pendaftaran: any) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
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
  <title>Invoice - ${pendaftaran.semester.nama}</title>
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
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #000;
    }
    .header h2 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 13px;
      margin: 4px 0;
      color: #000;
    }
    .invoice-title {
      text-align: center;
      margin: 30px 0;
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
      letter-spacing: 1px;
    }
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }
    .info-box {
      margin-bottom: 20px;
    }
    .info-box h3 {
      color: #000;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 12px;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
      text-transform: uppercase;
    }
    .info-box p {
      color: #000;
      font-size: 13px;
      margin: 8px 0;
      line-height: 1.8;
    }
    .info-box strong {
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      font-size: 12px;
    }
    th {
      background-color: #f5f5f5;
      color: #000;
      padding: 12px 8px;
      text-align: center;
      font-size: 12px;
      font-weight: bold;
      border: 1px solid #000;
    }
    td {
      padding: 10px 8px;
      border: 1px solid #000;
      font-size: 12px;
      text-align: left;
    }
    td:first-child,
    td:nth-child(4),
    td:nth-child(5) {
      text-align: center;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .total-section {
      margin-top: 30px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin: 12px 0;
      font-size: 14px;
      line-height: 1.8;
    }
    .total-label {
      width: 220px;
      text-align: right;
      padding-right: 20px;
      color: #000;
    }
    .total-value {
      width: 180px;
      text-align: right;
      font-weight: bold;
      color: #000;
    }
    .grand-total {
      font-size: 16px;
      color: #000;
      border-top: 2px solid #000;
      padding-top: 12px;
      margin-top: 15px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 11px;
    }
    @media print {
      body {
        padding: 15mm 20mm;
        margin: 0;
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

  <div class="invoice-title">
    INVOICE
  </div>

    <div class="info-section">
      <div class="info-box">
        <h3>Informasi Mahasiswa</h3>
        <p><strong>Nama:</strong> ${pendaftaran.userMaster.name}</p>
        <p><strong>NIM:</strong> ${pendaftaran.userMaster.nimOrNip}</p>
        <p><strong>Semester:</strong> ${pendaftaran.semester.nama}</p>
        <p>${pendaftaran.semester.tahun} - ${pendaftaran.semester.periode === 'GANJIL' ? 'Ganjil' : 'Genap'}</p>
      </div>
      <div class="info-box">
        <h3>Informasi Pembayaran</h3>
        <p><strong>No. Invoice:</strong> INV-${pendaftaran.id.slice(0, 8).toUpperCase()}/${new Date().getFullYear()}</p>
        <p><strong>Tanggal Invoice:</strong> ${formatDate(new Date())}</p>
        <p><strong>Tanggal Pembayaran:</strong> ${formatDate(pendaftaran.payment?.tanggalBayar || pendaftaran.createdAt)}</p>
        <p><strong>Status:</strong> ${
          pendaftaran.status === 'DITERIMA' ||
          pendaftaran.payment?.status === 'LUNAS' ||
          pendaftaran.payment?.status?.toUpperCase() === 'LUNAS'
            ? 'LUNAS'
            : 'Belum Lunas'
        }</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Kode</th>
          <th>Mata Kuliah</th>
          <th>SKS</th>
          <th>Biaya</th>
        </tr>
      </thead>
      <tbody>
        ${pendaftaran.detail.map((detail: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${detail.semesterMataKuliah.mataKuliah.kode}</td>
            <td>${detail.semesterMataKuliah.mataKuliah.nama}</td>
            <td>${detail.semesterMataKuliah.mataKuliah.sks}</td>
            <td>${formatCurrency(detail.semesterMataKuliah.biaya)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row">
        <div class="total-label">Total SKS:</div>
        <div class="total-value">${pendaftaran.totalSKS} SKS</div>
      </div>
      <div class="total-row grand-total">
        <div class="total-label">Total Pembayaran:</div>
        <div class="total-value">${formatCurrency(pendaftaran.totalBiaya)}</div>
      </div>
    </div>

    <div class="footer">
      <p>Terima kasih atas pembayaran Anda</p>
      <p>Invoice ini adalah bukti pembayaran yang sah</p>
      <p style="margin-top: 10px;">Dokumen ini dicetak secara otomatis dari sistem SIAKAD ITB YADIKA PASURUAN</p>
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

