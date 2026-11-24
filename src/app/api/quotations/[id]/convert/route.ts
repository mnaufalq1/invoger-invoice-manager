import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@/generated/prisma/enums";
import { checkUserQuota } from "@/lib/quota";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function generateInvoiceNumber(userId: string): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `INV-${yearMonth}-`;

  const latestDoc = await prisma.document.findFirst({
    where: {
      userId,
      type: "INVOICE",
      documentNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      documentNumber: "desc",
    },
    select: {
      documentNumber: true,
    },
  });

  let nextSequence = 1;
  if (latestDoc?.documentNumber) {
    const parts = latestDoc.documentNumber.split("-");
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSequence = lastNum + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(4, "0")}`;
}

export async function POST(_request: Request, { params }: RouteContext) {
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

    const quotation = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
        type: "QUOTATION",
      },
      include: {
        items: true,
        convertedTo: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { message: "Penawaran tidak ditemukan." },
        { status: 404 }
      );
    }

    if (quotation.convertedTo) {
      return NextResponse.json(
        {
          message: "Penawaran ini sudah pernah dikonversi menjadi invoice.",
          invoiceId: quotation.convertedTo.id,
        },
        { status: 400 }
      );
    }

    // Pengecekan batas kuota bulanan invoice paket Free (Waktu Global UTC)
    const quota = await checkUserQuota(session.user.id, "INVOICE");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          message: `Batas kuota bulanan paket Free telah tercapai (${quota.limit} invoice/bulan). Tidak dapat mengonversi penawaran menjadi invoice. Silakan upgrade ke paket Premium.`,
          code: "QUOTA_EXCEEDED",
          limitReached: true,
          used: quota.used,
          limit: quota.limit,
        },
        { status: 403 }
      );
    }

    // Generate nomor invoice baru
    const invoiceNumber = await generateInvoiceNumber(session.user.id);

    // Jalankan transaksi atomik
    const newInvoice = await prisma.$transaction(async (tx) => {
      // 1. Buat Invoice baru dari Quotation
      const invoice = await tx.document.create({
        data: {
          userId: session.user.id,
          customerId: quotation.customerId,
          type: "INVOICE",
          status: DocumentStatus.DRAFT,
          documentNumber: invoiceNumber,
          issueDate: new Date(),
          dueDate: quotation.dueDate,
          currency: quotation.currency,
          subtotal: quotation.subtotal,
          discountAmount: quotation.discountAmount,
          taxAmount: quotation.taxAmount,
          total: quotation.total,
          notes: quotation.notes,
          terms: quotation.terms,
          convertedFromId: quotation.id,
          items: {
            create: quotation.items.map((it) => ({
              description: it.description,
              quantity: it.quantity,
              unit: it.unit,
              unitPrice: it.unitPrice,
              lineTotal: it.lineTotal,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // 2. Ubah status quotation menjadi ACCEPTED
      await tx.document.update({
        where: { id: quotation.id },
        data: {
          status: DocumentStatus.ACCEPTED,
        },
      });

      return invoice;
    });

    return NextResponse.json(
      {
        message: "Penawaran berhasil dikonversi menjadi invoice.",
        invoice: newInvoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/quotations/[id]/convert error:", error);
    return NextResponse.json(
      { message: "Gagal mengonversi penawaran menjadi invoice." },
      { status: 500 }
    );
  }
}

