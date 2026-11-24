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

    // Pastikan akun memiliki profil dan paket.
    await prisma.profile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await prisma.subscription.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        planCode: "FREE",
        status: "ACTIVE",
      },
    });

    const [
      profile,
      subscription,
      quotaSummary,
      invoiceCount,
      paidInvoices,
      paymentsAggregate,
      unpaidInvoices,
      quotationCount,
      recentInvoices,
    ] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      getUserQuotaSummary(userId),
      prisma.document.count({
        where: { userId, type: "INVOICE" },
      }),
      prisma.document.findMany({
        where: { userId, type: "INVOICE", status: "PAID" },
        select: { total: true },
      }),
      prisma.payment.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.document.findMany({
        where: {
          userId,
          type: "INVOICE",
          status: { in: ["DRAFT", "SENT", "OVERDUE"] },
        },
        select: {
          id: true,
          documentNumber: true,
          total: true,
          status: true,
          dueDate: true,
          customer: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.document.count({
        where: { userId, type: "QUOTATION" },
      }),
      prisma.document.findMany({
        where: { userId, type: "INVOICE" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: {
            select: { name: true },
          },
        },
      }),
    ]);

    // Pendapatan riil: jumlah dari catatan Payment atau total invoice PAID
    const paidFromInvoices = paidInvoices.reduce(
      (acc, inv) => acc + Number(inv.total),
      0
    );
    const paidFromPayments = Number(paymentsAggregate._sum.amount || 0);
    const totalPaidRevenue = Math.max(paidFromPayments, paidFromInvoices);

    const totalUnpaidAmount = unpaidInvoices.reduce(
      (acc, inv) => acc + Number(inv.total),
      0
    );

    const isPremium = Boolean(quotaSummary?.subscription?.isPremium || subscription?.planCode === "PREMIUM");

    return NextResponse.json({
      name: session.user.name,
      email: session.user.email,
      profile,
      subscription,
      quotaSummary,
      isPremium,
      stats: {
        invoiceCount,
        paidRevenue: totalPaidRevenue,
        unpaidCount: unpaidInvoices.length,
        unpaidAmount: totalUnpaidAmount,
        quotationCount,
      },
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        documentNumber: inv.documentNumber,
        customerName: inv.customer?.name || "Pelanggan",
        status: inv.status,
        total: Number(inv.total),
        dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      })),
      unpaidInvoices: unpaidInvoices.slice(0, 5).map((inv) => ({
        id: inv.id,
        documentNumber: inv.documentNumber,
        customerName: inv.customer?.name || "Pelanggan",
        status: inv.status,
        total: Number(inv.total),
        dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data dashboard." },
      { status: 500 }
    );
  }
}
