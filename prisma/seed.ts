
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum diatur di file .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const plans = [
    {
      code: "FREE",
      name: "Free",
      monthlyPrice: 0,
      invoiceLimit: 10,
      quotationLimit: 10,
      features: {
        pdfExport: true,
        premiumTemplates: false,
        automaticReminders: false,
        advancedReports: false,
        removeBranding: false,
      },
      active: true,
    },
    {
      code: "PREMIUM",
      name: "Premium",
      monthlyPrice: 29000,
      invoiceLimit: null,
      quotationLimit: null,
      features: {
        pdfExport: true,
        premiumTemplates: true,
        automaticReminders: true,
        advancedReports: true,
        removeBranding: true,
      },
      active: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        invoiceLimit: plan.invoiceLimit,
        quotationLimit: plan.quotationLimit,
        features: plan.features,
        active: plan.active,
      },
      create: plan,
    });

    console.log(`Paket ${plan.name} berhasil disiapkan.`);
  }
}

main()
  .catch((error) => {
    console.error("Gagal menyiapkan paket InvoGer:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
