import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@/generated/prisma/enums";
import { checkUserQuota, getUserQuotaSummary } from "@/lib/quota";

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

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

type InputItem = {
  description: string;
  quantity?: number | string;
  unit?: string;
  unitPrice?: number | string;
};

function calculateTotals(
  items: InputItem[],
  discountInput?: number | string,
  taxInput?: number | string
) {
  let subtotal = 0;
  const processedItems = items.map((item) => {
    const qty = Math.max(0.01, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const lineTotal = Math.round(qty * price * 100) / 100;
    subtotal += lineTotal;

    return {
      description: item.description.trim(),
      quantity: qty,
      unit: item.unit?.trim() || "unit",
      unitPrice: price,
      lineTotal,
    };
  });

  const discount = Math.max(0, Number(discountInput) || 0);
  const tax = Math.max(0, Number(taxInput) || 0);
  const total = Math.max(0, Math.round((subtotal - discount + tax) * 100) / 100);

  return {
    items: processedItems,
    subtotal,
    discountAmount: discount,
    taxAmount: tax,
    total,
  };
}

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const customerId = searchParams.get("customerId")?.trim();

    const whereClause: {
      userId: string;
      type: "INVOICE";
      status?: DocumentStatus;
      customerId?: string;
      OR?: Array<{
        documentNumber?: { contains: string; mode: "insensitive" };
        customer?: { name: { contains: string; mode: "insensitive" } };
      }>;
    } = {
      userId: session.user.id,
      type: "INVOICE",
    };

    if (status && Object.values(DocumentStatus).includes(status as DocumentStatus)) {
      whereClause.status = status as DocumentStatus;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (search) {
      whereClause.OR = [
        { documentNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, quotaSummary] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      getUserQuotaSummary(session.user.id),
    ]);

    return NextResponse.json({
      invoices,
      quota: {
        planCode: quotaSummary.subscription.planCode,
        planName: quotaSummary.subscription.planName,
        isPremium: quotaSummary.subscription.isPremium,
        invoiceLimit: quotaSummary.invoices.limit,
        usedThisMonth: quotaSummary.invoices.used,
        isLimitReached: quotaSummary.invoices.isLimitReached,
        remaining: quotaSummary.invoices.remaining,
      },
      quotaSummary,
    });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data invoice." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const body = await request.json();

    const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
    if (!customerId) {
      return NextResponse.json(
        { message: "Pelanggan wajib dipilih." },
        { status: 400 }
      );
    }

    // Validasi kepemilikan customer
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: session.user.id,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan atau tidak valid." },
        { status: 400 }
      );
    }

    // Pengecekan batas kuota bulanan (Waktu Global UTC)
    const quota = await checkUserQuota(session.user.id, "INVOICE");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          message: `Batas kuota bulanan paket Free telah tercapai (${quota.limit} invoice/bulan). Silakan upgrade ke paket Premium untuk membuat invoice tanpa batas.`,
          code: "QUOTA_EXCEEDED",
          limitReached: true,
          used: quota.used,
          limit: quota.limit,
        },
        { status: 403 }
      );
    }

    // Validasi item
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { message: "Invoice harus memiliki minimal 1 item." },
        { status: 400 }
      );
    }

    const rawItems: InputItem[] = body.items;
    for (const item of rawItems) {
      if (!item.description || !item.description.trim()) {
        return NextResponse.json(
          { message: "Deskripsi setiap item wajib diisi." },
          { status: 400 }
        );
      }
    }

    // Penomoran invoice
    let documentNumber = clean(body.documentNumber);
    if (!documentNumber) {
      documentNumber = await generateInvoiceNumber(session.user.id);
    } else {
      // Periksa keunikan documentNumber kustom
      const existingDoc = await prisma.document.findFirst({
        where: {
          userId: session.user.id,
          documentNumber,
        },
      });

      if (existingDoc) {
        return NextResponse.json(
          { message: `Nomor invoice "${documentNumber}" sudah digunakan.` },
          { status: 400 }
        );
      }
    }

    // Perhitungan nilai uang di server
    const totals = calculateTotals(
      rawItems,
      body.discountAmount,
      body.taxAmount
    );

    const issueDate = body.issueDate ? new Date(body.issueDate) : new Date();
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;

    const invoice = await prisma.document.create({
      data: {
        userId: session.user.id,
        customerId,
        type: "INVOICE",
        status: DocumentStatus.DRAFT,
        documentNumber,
        issueDate,
        dueDate,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total,
        notes: clean(body.notes),
        terms: clean(body.terms),
        items: {
          create: totals.items.map((it) => ({
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

    return NextResponse.json(
      {
        message: "Invoice berhasil dibuat.",
        invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json(
      { message: "Gagal membuat invoice." },
      { status: 500 }
    );
  }
}

