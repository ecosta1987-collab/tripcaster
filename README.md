# TripCaster

Business trip planner built with Next.js, Tailwind CSS, Auth.js, Prisma, and Supabase-compatible Postgres.

## Features

- Google login with Auth.js
- Protected `My Trips` area
- Per-user trips, events, packing lists, and preferences
- Mock-first weather summaries and calendar imports
- Prisma schema and migration files ready for Supabase Postgres
- Vercel-friendly App Router structure

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Auth.js with Google provider
- Prisma ORM
- Supabase Postgres

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DATABASE_URL=
DIRECT_URL=
```

## Local setup

```bash
npm install
npm run db:generate
npm run db:deploy
npm run dev
```

Open `http://localhost:3000`.

## Database

The project includes:

- Prisma schema: `prisma/schema.prisma`
- Initial migration: `prisma/migrations/20260423110000_init_auth_and_trips/migration.sql`

For Supabase:

- Use the pooled connection string for `DATABASE_URL`
- Use the direct connection string for `DIRECT_URL`

## API routes

- `GET /api/trips`
- `POST /api/trips`
- `POST /api/trips/[tripId]/events`
- `POST /api/calendar/import`
- `POST /api/weather`
- `POST /api/packing-list`
- `GET /api/preferences`
- `PUT /api/preferences`

## Deployment notes

- Add the same environment variables in Vercel
- Make sure your Google OAuth callback URL includes:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://your-production-domain/api/auth/callback/google`
- Deploy after the Supabase schema is created
