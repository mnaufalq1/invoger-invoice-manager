
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clean(value: unknown) {
  if (typeof value !== "string") return null;
  return value.trim() || null;
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { message: "Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
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

    const businessName = clean(body.businessName ?? body.companyName);
    const businessEmail = clean(body.businessEmail ?? body.email);
    const businessPhone = clean(body.businessPhone ?? body.phone);
    const businessAddress = clean(body.businessAddress ?? body.address);
    const taxNumber = clean(body.taxNumber ?? body.npwp);

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        taxNumber,
      },
      create: {
        userId: session.user.id,
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        taxNumber,
      },
    });

    return NextResponse.json({
      message: "Profil bisnis berhasil disimpan.",
      profile,
    });
  } catch (error) {
    console.error("Profile API error:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan profil bisnis." },
      { status: 500 }
    );
  }
}
