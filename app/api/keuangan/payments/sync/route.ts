import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Invoice as InvoiceClient } from "xendit-node";

const xenditInvoiceClient = new InvoiceClient({
  secretKey: process.env.XENDIT_SECRET_KEY || "",
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== "KEUANGAN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.XENDIT_SECRET_KEY) {
      // Mock sync for development without API key
      const updatedMock = await prisma.payment.updateMany({
        where: {
          status: { in: ["BELUM_BAYAR", "MENUNGGU_VERIFIKASI"] },
          xenditInvoiceId: { startsWith: "mock_" },
        },
        data: {
          status: "LUNAS",
          tanggalBayar: new Date(),
        },
      });
      return NextResponse.json({ syncedCount: updatedMock.count });
    }

    // Ambil semua payment yang belum lunas dan punya xenditInvoiceId
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: { in: ["BELUM_BAYAR", "MENUNGGU_VERIFIKASI"] },
        xenditInvoiceId: { not: null },
      },
    });

    let syncedCount = 0;

    for (const payment of pendingPayments) {
      if (!payment.xenditInvoiceId) continue;
      
      try {
        const invoice = await xenditInvoiceClient.getInvoiceById({
          invoiceId: payment.xenditInvoiceId,
        });

        if (invoice.status === "PAID" || invoice.status === "SETTLED") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "LUNAS",
              tanggalBayar: new Date(invoice.updated || new Date()),
              metodePembayaran: invoice.paymentMethod || "xendit",
            },
          });
          syncedCount++;
        } else if (invoice.status === "EXPIRED") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "BELUM_BAYAR", // Atau status lain untuk expired
              xenditInvoiceId: null,
              paymentUrl: null,
            },
          });
          syncedCount++;
        }
      } catch (err) {
        console.error(`Failed to sync invoice ${payment.xenditInvoiceId}`, err);
      }
    }

    return NextResponse.json({ syncedCount });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json(
      { error: "Gagal melakukan sinkronisasi" },
      { status: 500 }
    );
  }
}
