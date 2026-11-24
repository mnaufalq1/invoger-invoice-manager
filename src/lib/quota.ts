import { prisma } from "@/lib/prisma";

export type QuotaCheckResult = {
  allowed: boolean;
  isPremium: boolean;
  used: number;
  limit: number | null;
  remaining: number | null;
  planName: string;
  planCode: string;
  period: {
    startOfMonth: Date;
    endOfMonth: Date;
  };
};

export type UserQuotaSummary = {
  subscription: {
    planCode: string;
    planName: string;
    status: string;
    currentPeriodEnd: Date | null;
    isPremium: boolean;
  };
  invoices: {
    used: number;
    limit: number | null;
    remaining: number | null;
    isLimitReached: boolean;
  };
  quotations: {
    used: number;
    limit: number | null;
    remaining: number | null;
    isLimitReached: boolean;
  };
  period: {
    startOfMonth: Date;
    endOfMonth: Date;
  };
};

/**
 * Menghitung batas waktu global (UTC) untuk bulan kalender berjalan.
 * Memastikan perhitungan kuota konsisten tanpa tergantung pada zona waktu lokal browser atau server.
 */
export function getCurrentMonthUtcWindow() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return { startOfMonth, endOfMonth };
}

/**
 * Memeriksa apakah user masih diperbolehkan membuat invoice atau quotation.
 */
export async function checkUserQuota(
  userId: string,
  type: "INVOICE" | "QUOTATION"
): Promise<QuotaCheckResult> {
  const { startOfMonth, endOfMonth } = getCurrentMonthUtcWindow();

  // Pastikan user memiliki record subscription
  let sub = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (!sub) {
    sub = await prisma.subscription.create({
      data: {
        userId,
        planCode: "FREE",
        status: "ACTIVE",
      },
      include: { plan: true },
    });
  }

  // Jika paket PREMIUM dan status masih aktif
  const isPremium = sub.planCode === "PREMIUM" && sub.status === "ACTIVE";

  // Cek apakah langganan premium sudah kadaluarsa jika ada batas currentPeriodEnd
  if (isPremium && sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) {
    // Turunkan status ke INACTIVE/FREE otomatis jika masa aktif habis
    await prisma.subscription.update({
      where: { userId },
      data: {
        planCode: "FREE",
        status: "ACTIVE",
      },
    });
    return checkUserQuota(userId, type);
  }

  if (isPremium) {
    return {
      allowed: true,
      isPremium: true,
      used: 0,
      limit: null,
      remaining: null,
      planName: sub.plan?.name || "Premium",
      planCode: sub.planCode,
      period: { startOfMonth, endOfMonth },
    };
  }

  // Untuk paket FREE: ambil batas kuota dari tabel plan (default 10)
  const limit =
    type === "INVOICE"
      ? sub.plan?.invoiceLimit ?? 10
      : sub.plan?.quotationLimit ?? 10;

  // Hitung jumlah dokumen yang telah dibuat user pada bulan kalender UTC ini
  const used = await prisma.document.count({
    where: {
      userId,
      type,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    isPremium: false,
    used,
    limit,
    remaining,
    planName: sub.plan?.name || "Free",
    planCode: sub.planCode,
    period: { startOfMonth, endOfMonth },
  };
}

/**
 * Mengambil ringkasan kuota dan status paket untuk dashboard / halaman langganan.
 */
export async function getUserQuotaSummary(userId: string): Promise<UserQuotaSummary> {
  const { startOfMonth, endOfMonth } = getCurrentMonthUtcWindow();

  let sub = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (!sub) {
    sub = await prisma.subscription.create({
      data: {
        userId,
        planCode: "FREE",
        status: "ACTIVE",
      },
      include: { plan: true },
    });
  }

  // Periksa expired premium
  let isPremium = sub.planCode === "PREMIUM" && sub.status === "ACTIVE";
  if (isPremium && sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) {
    sub = await prisma.subscription.update({
      where: { userId },
      data: {
        planCode: "FREE",
        status: "ACTIVE",
      },
      include: { plan: true },
    });
    isPremium = false;
  }

  const invoiceLimit = isPremium ? null : sub.plan?.invoiceLimit ?? 10;
  const quotationLimit = isPremium ? null : sub.plan?.quotationLimit ?? 10;

  const [invoicesUsed, quotationsUsed] = await Promise.all([
    prisma.document.count({
      where: {
        userId,
        type: "INVOICE",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    }),
    prisma.document.count({
      where: {
        userId,
        type: "QUOTATION",
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    }),
  ]);

  return {
    subscription: {
      planCode: sub.planCode,
      planName: sub.plan?.name || (isPremium ? "Premium" : "Free"),
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      isPremium,
    },
    invoices: {
      used: invoicesUsed,
      limit: invoiceLimit,
      remaining: invoiceLimit !== null ? Math.max(0, invoiceLimit - invoicesUsed) : null,
      isLimitReached: invoiceLimit !== null ? invoicesUsed >= invoiceLimit : false,
    },
    quotations: {
      used: quotationsUsed,
      limit: quotationLimit,
      remaining: quotationLimit !== null ? Math.max(0, quotationLimit - quotationsUsed) : null,
      isLimitReached: quotationLimit !== null ? quotationsUsed >= quotationLimit : false,
    },
    period: {
      startOfMonth,
      endOfMonth,
    },
  };
}

