"use client";

import { useEffect, useState } from "react";
import { EventPanel } from "@/components/event-panel";
import { PackingListCard } from "@/components/packing-list-card";
import { PreferencesCard } from "@/components/preferences-card";
import { TimezoneCard } from "@/components/timezone-card";
import { TripForm } from "@/components/trip-form";
import { TripList } from "@/components/trip-list";
import { WeatherCard } from "@/components/weather-card";
import {
  PackingListResponse,
  PreferencesResponse,
  Trip,
  TripsResponse,
  UserPreference,
  WeatherResponse
} from "@/lib/types";

type TripPlannerProps = {
  userName: string;
  userEmail: string;
};

export function TripPlanner({ userName, userEmail }: TripPlannerProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null;

  useEffect(() => {
    void loadTrips();
  }, []);

  useEffect(() => {
    if (!selectedTripId && trips.length) {
      setSelectedTripId(trips[0].id);
    }
  }, [selectedTripId, trips]);

  async function loadTrips() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/trips");
      if (!response.ok) {
        throw new Error("Unable to load your trips.");
      }
      const data = (await response.json()) as TripsResponse;
      setTrips(data.trips);
      setPreferences(data.preferences);
      setSelectedTripId((current) => current ?? data.trips[0]?.id ?? null);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your trips.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPackingList(tripId: string) {
    const response = await fetch("/api/packing-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId })
    });
    const data = (await response.json()) as PackingListResponse;
    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === tripId ? { ...trip, packingList: data.packingList } : trip
      )
    );
  }

  async function refreshWeather(tripId: string) {
    const response = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId })
    });
    const data = (await response.json()) as WeatherResponse;
    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === tripId ? { ...trip, weather: data.weather } : trip
      )
    );
  }

  async function handleCreateTrip(payload: {
    destination: string;
    startDate: string;
    endDate: string;
  }) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Unable to create trip.");
      }
      await loadTrips();
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create trip.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddEvent(payload: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: Trip["events"][number]["type"];
  }) {
    if (!selectedTrip) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/trips/${selectedTrip.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Unable to add event.");
      }
      await loadTrips();
      setError(null);
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : "Unable to add event.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImportEvents() {
    if (!selectedTrip) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/calendar/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: selectedTrip.id, source: "google-calendar" })
      });
      if (!response.ok) {
        throw new Error("Unable to import events.");
      }
      await loadTrips();
      setError(null);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Unable to import events.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefreshInsights() {
    if (!selectedTrip) {
      return;
    }

    setIsLoading(true);
    try {
      await refreshWeather(selectedTrip.id);
      await loadPackingList(selectedTrip.id);
      setError(null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Unable to refresh trip insights.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSavePreferences(payload: {
    homeTimezone: string;
    favoriteAirport: string;
    packingStyle: UserPreference["packingStyle"];
  }) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Unable to save preferences.");
      }
      const data = (await response.json()) as PreferencesResponse;
      setPreferences(data.preferences);
      await loadTrips();
      setError(null);
    } catch (preferencesError) {
      setError(
        preferencesError instanceof Error ? preferencesError.message : "Unable to save preferences."
      );
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
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-ink/10 bg-sand px-4 py-1 text-sm font-medium text-ink/80">
              My Trips
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Welcome back, {userName}.
            </h1>
            <p className="mt-3 text-base leading-7 text-ink/70">
              Your private travel planner is connected to Auth.js and a Postgres-backed data layer.
            </p>
          </div>

          <div className="rounded-3xl border border-ink/10 bg-white/90 px-5 py-4">
            <p className="text-sm font-medium text-ink">{userName}</p>
            <p className="mt-1 text-sm text-ink/60">{userEmail}</p>
            {preferences?.favoriteAirport ? (
              <p className="mt-3 text-sm text-ink/65">Preferred airport: {preferences.favoriteAirport}</p>
            ) : null}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TripList
          trips={trips}
          selectedTripId={selectedTripId}
          onSelectTrip={setSelectedTripId}
        />
        <TripForm onCreateTrip={handleCreateTrip} isLoading={isLoading} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <EventPanel
          trip={selectedTrip}
          onAddEvent={handleAddEvent}
          onImportEvents={handleImportEvents}
          isLoading={isLoading}
        />

        <div className="space-y-6">
          <PreferencesCard
            preferences={preferences}
            onSave={handleSavePreferences}
            isLoading={isLoading}
          />
          {selectedTrip ? (
            <>
              <button
                type="button"
                onClick={() => void handleRefreshInsights()}
                disabled={isLoading}
                className="w-full rounded-3xl border border-ink/10 bg-ink px-5 py-4 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Refresh weather and packing insights
              </button>
              <WeatherCard weather={selectedTrip.weather} />
              <TimezoneCard
                homeTimezone={selectedTrip.homeTimezone}
                destinationTimezone={selectedTrip.timezone}
              />
              <PackingListCard items={selectedTrip.packingList} />
            </>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white/70 p-6 text-sm text-ink/60">
              Create or select a trip to see travel insights.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
