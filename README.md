# DailyFoodDeals 🍔

Sizzling snacks and daily deals that won't break the bank.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: SQLite/libSQL via Prisma v7 (works with local SQLite or Turso/libSQL)
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
   - Local development can use `DATABASE_URL="file:./prisma/dev.db"`
   - Production can use `DATABASE_URL` directly or Turso via `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`

3. Push database schema and seed:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   - The seed now includes an example all-location brand deal so multi-location browse, detail, map, and moderation flows can be exercised locally.

4. Run the development server:
   ```bash
   npm run dev
   ```

## Seed Accounts

- **Local development / tests only**:
  - **Admin**: admin@dailyfooddeals.com / admin123
  - **User**: user@example.com / user1234
- **Production**:
  - the seed does **not** create a generic admin account
  - set `ADMIN_EMAILS` to a comma-separated list of existing account emails that should be promoted to `ADMIN`
  - create those accounts first, then rerun `npx prisma db seed`
  - if no existing account matches `ADMIN_EMAILS`, the seed leaves admin access unchanged and does not create a fallback admin

## Features

- Browse food deals with filters (day, cuisine, category, options)
- Search deals by keyword
- Find chain-wide deals that apply across multiple participating locations
- Use location-aware browse/detail views to surface the nearest participating restaurant when coordinates are available
- View participating and non-participating locations for all-location deals
- Submit new deals (requires account)
- Vote on deals (up/down/confirm/expired)
- Community members can submit location participation corrections for review
- Save favorite deals
- Admin/owner management tools can approve/reject/verify deals and manage location participation
- Sample/demo records can be marked and are clearly labeled in cards, deal details, maps, and notices
- JWT-based authentication with email/password

## Multi-location Deal Model

- `Brand` groups related restaurant locations under one chain or franchise
- `Deal.scope` distinguishes normal single-location deals from all-location deals
- all-location deals still use the existing `Deal` model and attach participation overrides per location
- admins and owners can directly mark locations as participating or non-participating
- community suggestions create review items before public data changes

## Sample Data

- Fallback/demo data is labeled in the public UI
- Individual deals can also be marked as sample data from the management dashboard
- Sample labels appear at both the page level and the record level so demo content stays obvious

## Validation

Primary validation commands:

```bash
npm run lint
npm run build
npm run test:e2e
```

The detailed design for multi-location deals is documented in `docs/plans/2026-03-17-multi-location-deals-design.md`.
