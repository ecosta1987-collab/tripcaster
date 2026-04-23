# TripCaster

Mock-first business trip planner built with Next.js, Tailwind CSS, and App Router API routes.

## Features

- Create trips with destination and date ranges
- Add manual calendar events
- Import mock calendar events through an API route
- Show timezone conversion snapshots
- Fetch mock weather for the destination
- Generate a packing list based on weather and event mix

## Tech

- Next.js App Router
- TypeScript
- Tailwind CSS
- Route handlers under `app/api/*`
- Vercel-friendly structure with no custom server

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API routes

- `GET /api/trips`
- `POST /api/trips`
- `POST /api/calendar/import`
- `POST /api/weather`
- `POST /api/packing-list`

## Next steps

- Replace mock calendar import with Google or Microsoft calendar OAuth
- Connect a live weather provider
- Persist trips in a database
- Add authentication and team sharing
