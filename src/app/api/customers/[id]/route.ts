import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data pelanggan." },
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
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { message: "Nama pelanggan wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan." },
        { status: 404 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email: clean(body.email),
        phone: clean(body.phone),
        address: clean(body.address),
        notes: clean(body.notes),
      },
    });

    return NextResponse.json({
      message: "Data pelanggan berhasil diperbarui.",
      customer,
    });
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui data pelanggan." },
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

    const existing = await prisma.customer.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Pelanggan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (existing._count.documents > 0) {
      return NextResponse.json(
        {
          message:
            "Pelanggan tidak dapat dihapus karena sudah memiliki invoice atau penawaran terkait.",
        },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Pelanggan berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json(
      { message: "Gagal menghapus pelanggan." },
      { status: 500 }
    );
  }
}

