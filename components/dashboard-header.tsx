import { CloudSun, Luggage, PlaneTakeoff } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
      <div className="absolute inset-0 bg-grid bg-[size:32px_32px] opacity-40" />
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-sky/20 blur-3xl" />
      <div className="absolute bottom-0 left-20 h-36 w-36 rounded-full bg-coral/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex rounded-full border border-ink/10 bg-sand px-4 py-1 text-sm font-medium text-ink/80">
            Business travel, organized before wheels up
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            TripCaster plans the calendar, weather, timezone, and suitcase in one flow.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
            This starter uses mock data and internal API routes so we can ship UI and workflows now,
            then swap in real calendars and weather providers later.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink/10 bg-white/90 p-4">
            <PlaneTakeoff className="h-5 w-5 text-coral" />
            <p className="mt-3 text-sm font-medium text-ink">Trip setup</p>
            <p className="mt-1 text-sm text-ink/60">Destination, dates, and travel context.</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white/90 p-4">
            <CloudSun className="h-5 w-5 text-sky" />
            <p className="mt-3 text-sm font-medium text-ink">Weather aware</p>
            <p className="mt-1 text-sm text-ink/60">Mock forecast summaries per trip.</p>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-white/90 p-4">
            <Luggage className="h-5 w-5 text-mint" />
            <p className="mt-3 text-sm font-medium text-ink">Packing guidance</p>
            <p className="mt-1 text-sm text-ink/60">Generated from meetings and forecast.</p>
          </div>
        </div>
      </div>
    </header>
  );
}
