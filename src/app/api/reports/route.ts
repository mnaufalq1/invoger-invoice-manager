import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "this_month";

    // Hitung range tanggal berdasarkan period
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (period === "this_month") {
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    } else if (period === "last_3_months") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = now;
    } else if (period === "this_year") {
      startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));
    }
    // period === "all" -> startDate & endDate tetap null

    const dateFilter =
      startDate && endDate
        ? {
            gte: startDate,
            lte: endDate,
          }
        : undefined;

    // Ambil semua invoice dalam range
    const invoices = await prisma.document.findMany({
      where: {
        userId,
        type: "INVOICE",
        ...(dateFilter ? { issueDate: dateFilter } : {}),
      },
      include: {
        customer: true,
        payments: true,
      },
      orderBy: { issueDate: "desc" },
    });

    // Ambil semua quotation dalam range
    const quotations = await prisma.document.findMany({
      where: {
        userId,
        type: "QUOTATION",
        ...(dateFilter ? { issueDate: dateFilter } : {}),
      },
    });

    // Ambil riwayat pembayaran
    const payments = await prisma.payment.findMany({
      where: {
        userId,
        ...(dateFilter ? { paymentDate: dateFilter } : {}),
      },
      include: {
        document: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
      take: 10,
    });

    // 1. Agregasi Finansial
    let totalRevenue = 0; // Total yang sudah dibayar
    let totalGrossInvoiced = 0; // Total nilai invoice terbit
    let totalOutstanding = 0; // Sisa tagihan belum lunas
    let totalOverdue = 0; // Sisa tagihan jatuh tempo

    const statusCounts: Record<string, { count: number; total: number }> = {
      PAID: { count: 0, total: 0 },
      SENT: { count: 0, total: 0 },
      DRAFT: { count: 0, total: 0 },
      OVERDUE: { count: 0, total: 0 },
      CANCELLED: { count: 0, total: 0 },
    };

    // Tracking per customer
    const customerAggregates: Record<
      string,
      { id: string; name: string; totalInvoiced: number; totalPaid: number; invoiceCount: number }
    > = {};

    for (const inv of invoices) {
      const invTotal = Number(inv.total) || 0;
      totalGrossInvoiced += invTotal;

      const paidForThisInvoice = (inv.payments || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      totalRevenue += paidForThisInvoice;

      const balance = Math.max(0, invTotal - paidForThisInvoice);

      if (inv.status !== "CANCELLED") {
        totalOutstanding += balance;
      }

      const isOverdue =
        inv.status === "OVERDUE" ||
        (inv.dueDate && new Date(inv.dueDate) < now && balance > 0 && inv.status !== "CANCELLED");

      if (isOverdue) {
        totalOverdue += balance;
      }

      // Status breakdown
      const st = inv.status || "DRAFT";
      if (!statusCounts[st]) {
        statusCounts[st] = { count: 0, total: 0 };
      }
      statusCounts[st].count += 1;
      statusCounts[st].total += invTotal;

      // Customer breakdown
      if (inv.customer) {
        const cId = inv.customer.id;
        if (!customerAggregates[cId]) {
          customerAggregates[cId] = {
            id: cId,
            name: inv.customer.name,
            totalInvoiced: 0,
            totalPaid: 0,
            invoiceCount: 0,
          };
        }
        customerAggregates[cId].totalInvoiced += invTotal;
        customerAggregates[cId].totalPaid += paidForThisInvoice;
        customerAggregates[cId].invoiceCount += 1;
      }
    }

    // Top 5 Pelanggan
    const topCustomers = Object.values(customerAggregates)
      .sort((a, b) => b.totalPaid - a.totalPaid || b.totalInvoiced - a.totalInvoiced)
      .slice(0, 5);

    // 2. Statistik Penawaran (Quotation)
    const totalQuotations = quotations.length;
    const acceptedQuotations = quotations.filter((q) => q.status === "ACCEPTED").length;
    const totalQuotationValue = quotations.reduce((sum, q) => sum + Number(q.total || 0), 0);
    const conversionRate =
      totalQuotations > 0 ? Math.round((acceptedQuotations / totalQuotations) * 100) : 0;

    // 3. Format Riwayat Pembayaran Terbaru
    const recentPayments = payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentDate: p.paymentDate,
      paymentMethod: p.paymentMethod,
      reference: p.reference,
      invoiceNumber: p.document.documentNumber,
      customerName: p.document.customer?.name || "Pelanggan Umum",
    }));

    return NextResponse.json({
      period,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalGrossInvoiced: Math.round(totalGrossInvoiced * 100) / 100,
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        totalOverdue: Math.round(totalOverdue * 100) / 100,
        totalInvoices: invoices.length,
        totalQuotations,
        acceptedQuotations,
        totalQuotationValue: Math.round(totalQuotationValue * 100) / 100,
        conversionRate,
      },
      statusDistribution: statusCounts,
      topCustomers,
      recentPayments,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { message: "Gagal memproses data laporan bisnis." },
      { status: 500 }
    );
  }
}
