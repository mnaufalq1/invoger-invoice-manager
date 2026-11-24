import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { message: "Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const invoice = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
        type: "INVOICE",
      },
      select: {
        id: true,
        total: true,
        status: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice tidak ditemukan." },
        { status: 404 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        documentId: id,
        userId: session.user.id,
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    const totalPaid = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const invoiceTotal = Number(invoice.total);
    const balanceDue = Math.max(0, Math.round((invoiceTotal - totalPaid) * 100) / 100);

    return NextResponse.json({
      payments,
      summary: {
        invoiceTotal,
        totalPaid,
        balanceDue,
        isFullyPaid: balanceDue <= 0,
      },
    });
  } catch (error) {
    console.error("GET /api/invoices/[id]/payments error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data riwayat pembayaran." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { message: "Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const invoice = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
        type: "INVOICE",
      },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice tidak ditemukan." },
        { status: 404 }
      );
    }

    const amount = Number(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { message: "Jumlah nominal pembayaran harus lebih dari 0." },
        { status: 400 }
      );
    }

    const currentPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const invoiceTotal = Number(invoice.total);
    const balanceDue = Math.max(0, Math.round((invoiceTotal - currentPaid) * 100) / 100);

    if (balanceDue <= 0 && invoice.status === "PAID") {
      return NextResponse.json(
        { message: "Invoice ini sudah lunas sepenuhnya." },
        { status: 400 }
      );
    }

    // Toleransi pembulatan pecahan desimal 0.01
    if (amount > balanceDue + 0.01) {
      return NextResponse.json(
        {
          message: `Nominal pembayaran (Rp ${amount.toLocaleString("id-ID")}) melebihi sisa tagihan (Rp ${balanceDue.toLocaleString("id-ID")}).`,
        },
        { status: 400 }
      );
    }

    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date();
    const paymentMethod = clean(body.paymentMethod) || "BANK_TRANSFER";
    const reference = clean(body.reference);
    const notes = clean(body.notes);

    // Jalankan dalam transaksi: buat catatan pembayaran dan perbarui status invoice jika lunas
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: session.user.id,
          documentId: id,
          amount,
          paymentDate,
          paymentMethod,
          reference,
          notes,
        },
      });

      const newTotalPaid = currentPaid + amount;
      const isNowFullyPaid = newTotalPaid >= invoiceTotal - 0.01;

      let updatedInvoice = invoice;
      if (isNowFullyPaid && invoice.status !== "PAID") {
        updatedInvoice = await tx.document.update({
          where: { id },
          data: {
            status: "PAID",
          },
          include: {
            customer: true,
            items: true,
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
        });
      }

      return { payment, newTotalPaid, isNowFullyPaid, updatedInvoice };
    });

    return NextResponse.json(
      {
        message: result.isNowFullyPaid
          ? "Pembayaran berhasil dicatat. Status invoice kini LUNAS!"
          : "Pembayaran berhasil dicatat.",
        payment: result.payment,
        summary: {
          invoiceTotal,
          totalPaid: result.newTotalPaid,
          balanceDue: Math.max(0, Math.round((invoiceTotal - result.newTotalPaid) * 100) / 100),
          isFullyPaid: result.isNowFullyPaid,
        },
        invoice: result.updatedInvoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invoices/[id]/payments error:", error);
    return NextResponse.json(
      { message: "Gagal mencatat pembayaran invoice." },
      { status: 500 }
    );
  }
}

