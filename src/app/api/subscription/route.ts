import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserQuotaSummary } from "@/lib/quota";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const [plans, quotaSummary] = await Promise.all([
      prisma.plan.findMany({
        where: { active: true },
        orderBy: { monthlyPrice: "asc" },
      }),
      getUserQuotaSummary(userId),
    ]);

    return NextResponse.json({
      plans,
      currentSubscription: quotaSummary.subscription,
      quotaSummary,
    });
  } catch (error) {
    console.error("GET /api/subscription error:", error);
    return NextResponse.json(
      { message: "Gagal memuat status langganan." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const targetPlanCode = String(body.planCode || "").trim().toUpperCase();

    if (!["FREE", "PREMIUM"].includes(targetPlanCode)) {
      return NextResponse.json(
        { message: "Paket yang dipilih tidak valid." },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({
      where: { code: targetPlanCode },
    });

    if (!plan) {
      return NextResponse.json(
        { message: "Data paket tidak ditemukan." },
        { status: 404 }
      );
    }

    const now = new Date();
    // Jika upgrade ke PREMIUM, berikan periode aktif 30 hari ke depan
    const currentPeriodEnd =
      targetPlanCode === "PREMIUM"
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null;

    const updatedSub = await prisma.subscription.upsert({
      where: { userId },
      update: {
        planCode: targetPlanCode,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd,
      },
      create: {
        userId,
        planCode: targetPlanCode,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd,
      },
      include: { plan: true },
    });

    const quotaSummary = await getUserQuotaSummary(userId);

    return NextResponse.json({
      message:
        targetPlanCode === "PREMIUM"
          ? "Selamat! Paket Anda berhasil di-upgrade ke Premium."
          : "Paket Anda telah diatur ke Free.",
      subscription: updatedSub,
      quotaSummary,
    });
  } catch (error) {
    console.error("POST /api/subscription error:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui status langganan." },
      { status: 500 }
    );
  }
}
