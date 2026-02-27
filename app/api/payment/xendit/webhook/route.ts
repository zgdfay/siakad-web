import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // In production, you must verify the webhook signature here using process.env.XENDIT_WEBHOOK_TOKEN
    const xenditToken = request.headers.get("x-callback-token");

    if (
      process.env.XENDIT_WEBHOOK_TOKEN &&
      xenditToken !== process.env.XENDIT_WEBHOOK_TOKEN
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();

    // Ensure status is PAID or SETTLED (e-wallets normally use SETTLED, VA uses PAID)
    if (payload.status === "PAID" || payload.status === "SETTLED") {
      const invoiceId = payload.id;
      const paymentMethod = payload.payment_method;

      // Find the corresponding payment in DB
      const payment = await prisma.payment.findUnique({
        where: { xenditInvoiceId: invoiceId },
        include: { pendaftaran: true },
      });

      if (payment) {
        // Update payment to LUNAS and trigger status acceptance if needed
        await prisma.$transaction(async (tx) => {
          // 1. Update Payment status
          // Payment is verified by Xendit, but our business logic requires Keuangan to manually verify it
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "MENUNGGU_VERIFIKASI",
              tanggalBayar: new Date(payload.paid_at || new Date()),
              metodePembayaran: paymentMethod || "xendit",
            },
          });
        });

        // Trigger email notification code could go here, or we let the frontend polling handle it.
      }
    } else if (payload.status === "EXPIRED") {
      // Mark payment as dropped or handle invoice expiration
      // Optional: Clean up paymentUrl so they can generate a new one
      const invoiceId = payload.id;
      await prisma.payment.updateMany({
        where: { xenditInvoiceId: invoiceId, status: "BELUM_BAYAR" },
        data: {
          xenditInvoiceId: null,
          paymentUrl: null,
        },
      });
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error: any) {
    console.error("Xendit Webhook Error:", error);
    // Returning 500 will cause Xendit to retry the webhook delivery
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
