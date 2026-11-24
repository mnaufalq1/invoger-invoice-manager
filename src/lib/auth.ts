
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.$transaction([
            prisma.profile.upsert({
              where: {
                userId: user.id,
              },
              update: {},
              create: {
                userId: user.id,
              },
            }),

            prisma.subscription.upsert({
              where: {
                userId: user.id,
              },
              update: {},
              create: {
                userId: user.id,
                planCode: "FREE",
                status: "ACTIVE",
              },
            }),
          ]);
        },
      },
    },
  },
});
