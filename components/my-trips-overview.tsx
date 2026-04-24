"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarRange, MapPinned, Plus } from "lucide-react";
import { Trip, TripsResponse } from "@/lib/types";

type MyTripsOverviewProps = {
  userName: string;
  userEmail: string;
};

export function MyTripsOverview({ userName, userEmail }: MyTripsOverviewProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void loadTrips();
  }, []);

  async function parseApiResponse(response: Response) {
    const rawText = await response.text();

    if (!rawText.trim()) {
      return { error: "The server returned an empty response." };
    }

    try {
      return JSON.parse(rawText) as TripsResponse | { error?: string };
    } catch {
      return {
        error: response.ok
          ? "The server returned an invalid response."
          : "The server returned an unexpected error page."
      };
    }
  }

  async function loadTrips() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/trips");
      const data = await parseApiResponse(response);

      if (!response.ok || !("trips" in data)) {
        throw new Error(("error" in data && data.error) || "Unable to load your trips.");
      }

      setTrips(data.trips);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your trips.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTrip(formData: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? ""),
          destination: String(formData.get("destination") ?? ""),
          startDate: String(formData.get("startDate") ?? ""),
          endDate: String(formData.get("endDate") ?? "")
        })
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(("error" in data && data.error) || "Unable to create trip.");
      }

      await loadTrips();
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create trip.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
        <div className="absolute inset-0 bg-grid bg-[size:32px_32px] opacity-40" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute bottom-0 left-20 h-36 w-36 rounded-full bg-coral/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-ink/10 bg-sand px-4 py-1 text-sm font-medium text-ink/80">
              My Trips
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Scheduled travel at a glance.
            </h1>
            <p className="mt-3 text-base leading-7 text-ink/70">
              Review each trip as a card with title, dates, place summary, and a visual preview.
              Open a trip to manage steps, weather, travel, agenda, and packing in dedicated tabs.
            </p>
          </div>

          <div className="rounded-3xl border border-ink/10 bg-white/90 px-5 py-4">
            <p className="text-sm font-medium text-ink">{userName}</p>
            <p className="mt-1 text-sm text-ink/60">{userEmail}</p>
            <p className="mt-3 text-sm text-ink/65">
              {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/my-trips/${trip.id}`}
              className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white/85 shadow-lg shadow-ink/5 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
                <div className="h-56 bg-[#dbe8ef]">
                  <img
                    src={trip.placeInfo.imageUrl}
                    alt={trip.destination}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPinned className="h-4 w-4 text-coral" />
                        <p className="text-xl font-semibold text-ink">{trip.title}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-ink/60">
                        <CalendarRange className="h-4 w-4 text-mint" />
                        <span>
                          {trip.startDate} to {trip.endDate}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ink/60">
                      {trip.steps.length} {trip.steps.length === 1 ? "step" : "steps"}
                    </span>
                  </div>

                  {trip.description ? (
                    <p className="mt-4 text-sm leading-6 text-ink/65">{trip.description}</p>
                  ) : null}

                  <p className="mt-4 text-sm leading-6 text-ink/70">{trip.placeInfo.summary}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {trip.placeInfo.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full border border-ink/10 bg-[#fffdf8] px-3 py-1 text-xs text-ink/65"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {!trips.length && !isLoading ? (
            <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white/70 p-6 text-sm text-ink/60">
              No trips yet. Create the first one to start building the overview and detail pages.
            </div>
          ) : null}
        </div>

        <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
          <p className="text-sm uppercase tracking-[0.2em] text-ink/45">New Trip</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Create a scheduled trip</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Start with the general trip information. You can edit steps and everything else from the
            trip detail page.
          </p>

          <form action={handleCreateTrip} className="mt-6 grid gap-4">
            <label className="text-sm font-medium text-ink">
              Title
              <input
                name="title"
                required
                placeholder="Spring client tour"
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
              />
            </label>

            <label className="text-sm font-medium text-ink">
              Description
              <textarea
                name="description"
                rows={3}
                placeholder="Meetings, site visits, and a return flight via another city."
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
              />
            </label>

            <label className="text-sm font-medium text-ink">
              Primary destination
              <input
                name="destination"
                required
                placeholder="Tokyo"
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-ink">
                Start date
                <input
                  name="startDate"
                  type="date"
                  required
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                End date
                <input
                  name="endDate"
                  type="date"
                  required
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-sky"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-medium text-white transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create trip
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
