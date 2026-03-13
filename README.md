# DailyFoodDeals 🍔

Sizzling snacks and daily deals that won't break the bank.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: SQLite via Prisma v5
- **Auth**: NextAuth.js v5 (beta) with credentials provider and JWT sessions
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```

3. Push database schema and seed:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Seed Accounts

- **Admin**: admin@dailyfooddeals.com / admin123
- **User**: user@example.com / user1234

## Features

- Browse food deals with filters (day, cuisine, category, options)
- Search deals by keyword
- Submit new deals (requires account)
- Vote on deals (up/down/confirm/expired)
- Save favorite deals
- Admin dashboard to approve/reject/verify deals
- JWT-based authentication with email/password
