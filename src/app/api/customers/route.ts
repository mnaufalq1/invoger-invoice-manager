import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim() || null;
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

    const whereClause: {
      userId: string;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
        phone?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      userId: session.user.id,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data pelanggan." },
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
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { message: "Nama pelanggan wajib diisi." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        userId: session.user.id,
        name,
        email: clean(body.email),
        phone: clean(body.phone),
        address: clean(body.address),
        notes: clean(body.notes),
      },
    });

    return NextResponse.json(
      {
        message: "Pelanggan berhasil ditambahkan.",
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan pelanggan." },
      { status: 500 }
    );
  }
}

