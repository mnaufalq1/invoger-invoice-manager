## Invoger Invoice Manager

A SaaS invoice manager for small businesses and freelancers.

### Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Shadcn UI

### Directory Structure

```
invoger-invoice-manager/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   └── quotations/
│   ├── generated/
│   │   └── prisma/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── plans.ts
│   └── types/
├── prisma7.config.ts
├── .env
└── package.json
```
