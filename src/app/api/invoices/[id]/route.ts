import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@/generated/prisma/enums";

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
      include: {
        customer: true,
        items: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data invoice." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
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

    const existing = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
        type: "INVOICE",
      },
      include: {
        items: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Invoice tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jika hanya mengubah status
    if (body.status && Object.keys(body).length === 1) {
      if (!Object.values(DocumentStatus).includes(body.status)) {
        return NextResponse.json(
          { message: "Status invoice tidak valid." },
          { status: 400 }
        );
      }

      const updated = await prisma.document.update({
        where: { id },
        data: { status: body.status },
        include: {
          customer: true,
          items: true,
        },
      });

      return NextResponse.json({
        message: "Status invoice berhasil diperbarui.",
        invoice: updated,
      });
    }

    // Pembaruan lengkap
    const customerId = typeof body.customerId === "string" ? body.customerId.trim() : existing.customerId;
    if (customerId !== existing.customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, userId: session.user.id },
      });
      if (!customer) {
        return NextResponse.json(
          { message: "Pelanggan tidak valid atau tidak ditemukan." },
          { status: 400 }
        );
      }
    }

    // Validasi nomor invoice jika diubah
    if (body.documentNumber && body.documentNumber.trim() !== existing.documentNumber) {
      const docNum = body.documentNumber.trim();
      const duplicate = await prisma.document.findFirst({
        where: {
          userId: session.user.id,
          documentNumber: docNum,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { message: `Nomor invoice "${docNum}" sudah digunakan.` },
          { status: 400 }
        );
      }
    }

    // Validasi item jika dikirim
    const rawItems: InputItem[] = Array.isArray(body.items) ? body.items : existing.items;
    if (rawItems.length === 0) {
      return NextResponse.json(
        { message: "Invoice harus memiliki minimal 1 item." },
        { status: 400 }
      );
    }

    for (const item of rawItems) {
      if (!item.description || !item.description.trim()) {
        return NextResponse.json(
          { message: "Deskripsi setiap item wajib diisi." },
          { status: 400 }
        );
      }
    }

    const totals = calculateTotals(
      rawItems,
      body.discountAmount !== undefined ? body.discountAmount : Number(existing.discountAmount),
      body.taxAmount !== undefined ? body.taxAmount : Number(existing.taxAmount)
    );

    const updated = await prisma.$transaction(async (tx) => {
      // Hapus item lama dan buat item baru jika array items dikirim
      if (Array.isArray(body.items)) {
        await tx.documentItem.deleteMany({
          where: { documentId: id },
        });

        await tx.documentItem.createMany({
          data: totals.items.map((it) => ({
            documentId: id,
            description: it.description,
            quantity: it.quantity,
            unit: it.unit,
            unitPrice: it.unitPrice,
            lineTotal: it.lineTotal,
          })),
        });
      }

      return await tx.document.update({
        where: { id },
        data: {
          customerId,
          documentNumber: clean(body.documentNumber) || existing.documentNumber,
          status: body.status && Object.values(DocumentStatus).includes(body.status) ? body.status : existing.status,
          issueDate: body.issueDate ? new Date(body.issueDate) : existing.issueDate,
          dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : existing.dueDate,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxAmount: totals.taxAmount,
          total: totals.total,
          notes: body.notes !== undefined ? clean(body.notes) : existing.notes,
          terms: body.terms !== undefined ? clean(body.terms) : existing.terms,
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    return NextResponse.json({
      message: "Invoice berhasil diperbarui.",
      invoice: updated,
    });
  } catch (error) {
    console.error("PUT /api/invoices/[id] error:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui invoice." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
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

    const existing = await prisma.document.findFirst({
      where: {
        id,
        userId: session.user.id,
        type: "INVOICE",
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Invoice tidak ditemukan." },
        { status: 404 }
      );
    }

    if (existing.status === DocumentStatus.PAID) {
      return NextResponse.json(
        { message: "Invoice yang sudah lunas (PAID) tidak dapat dihapus." },
        { status: 400 }
      );
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Invoice berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus invoice." },
      { status: 500 }
    );
  }
}

