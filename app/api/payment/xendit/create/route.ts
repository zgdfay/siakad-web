import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Invoice as InvoiceClient } from "xendit-node";

// Xendit client initialization
const xenditInvoiceClient = new InvoiceClient({
  secretKey: process.env.XENDIT_SECRET_KEY || "",
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { pendaftaranId } = body;

    if (!pendaftaranId) {
      return NextResponse.json(
        { error: "Pendaftaran ID wajib diisi" },
        { status: 400 }
      );
    }

    // Get pendaftaran details
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        payment: true,
        userMaster: {
          select: {
            name: true,
            account: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!pendaftaran) {
      return NextResponse.json(
        { error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!pendaftaran.payment) {
      return NextResponse.json(
        { error: "Data pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if payment already completed
    if (pendaftaran.payment.status === "LUNAS") {
      return NextResponse.json(
        { error: "Pendaftaran sudah dibayar lunas" },
        { status: 400 }
      );
    }

    // Check if xendit invoice already created and URL is still valid (not expired)
    // Simplify logic: You could add timestamp checks here if Xendit URLs expire
    if (pendaftaran.payment.paymentUrl && pendaftaran.payment.xenditInvoiceId) {
      return NextResponse.json({
        message: "Invoice sudah ada",
        paymentUrl: pendaftaran.payment.paymentUrl,
        invoiceId: pendaftaran.payment.xenditInvoiceId,
      });
    }

    const { getBaseUrl } = await import("@/lib/url");
    const baseUrl = getBaseUrl(request);
    
    // Fallback if environment variables are not set
    if (!process.env.XENDIT_SECRET_KEY) {
      console.warn("XENDIT_SECRET_KEY IS NOT SET. USING MOCK PAYMENT URL.");
      // In a real environment, throw an error. For development, we return a mock URL.
      const mockInvoiceId = `mock_invoice_${Date.now()}`;
      const mockPaymentUrl = `${baseUrl}/mahasiswa/pendaftaran/${pendaftaran.semesterId}/pembayaran/success?pendaftaranId=${pendaftaranId}&mock=true`;

      await prisma.payment.update({
        where: { id: pendaftaran.payment.id },
        data: {
          xenditInvoiceId: mockInvoiceId,
          paymentUrl: mockPaymentUrl,
          metodePembayaran: "xendit",
        },
      });

      return NextResponse.json({
        message: "Memakai mock URL karena API Key tidak diset",
        paymentUrl: mockPaymentUrl,
        invoiceId: mockInvoiceId,
      });
    }

    // Generate xendit invoice
    const invoiceRequest = {
      externalId: `SA_${pendaftaran.id}`,
      amount: pendaftaran.totalBiaya,
      payerEmail: pendaftaran.userMaster.account?.email || "student@example.com",
      description: `Pembayaran Semester Antara - ${pendaftaran.userMaster.name}`,
      successRedirectUrl: `${baseUrl}/mahasiswa/pendaftaran/${pendaftaran.semesterId}/pembayaran/success?pendaftaranId=${pendaftaranId}`,
      failureRedirectUrl: `${baseUrl}/mahasiswa/pendaftaran/${pendaftaran.semesterId}/pembayaran`,
    };

    const invoice = await xenditInvoiceClient.createInvoice({
      data: invoiceRequest,
    });

    if (!invoice.invoiceUrl) {
      throw new Error("Xendit failed to return an invoice URL");
    }

    // Update payment record with xendit data
    await prisma.payment.update({
      where: { id: pendaftaran.payment.id },
      data: {
        xenditInvoiceId: invoice.id,
        paymentUrl: invoice.invoiceUrl,
        metodePembayaran: "xendit",
      },
    });

    return NextResponse.json({
      message: "Invoice berhasil dibuat",
      paymentUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
    });
  } catch (error: any) {
    console.error("Create Xendit Invoice Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat invoice melalui payment gateway" },
      { status: 500 }
    );
  }
}
