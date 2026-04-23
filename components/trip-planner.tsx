"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { EventPanel } from "@/components/event-panel";
import { PackingListCard } from "@/components/packing-list-card";
import { TimezoneCard } from "@/components/timezone-card";
import { TripForm } from "@/components/trip-form";
import { TripList } from "@/components/trip-list";
import { WeatherCard } from "@/components/weather-card";
import { PackingListResponse, Trip, TripsResponse, WeatherResponse } from "@/lib/types";

export function TripPlanner() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [packingList, setPackingList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null;

  useEffect(() => {
    void loadTrips();
  }, []);

  useEffect(() => {
    if (!selectedTripId && trips.length) {
      setSelectedTripId(trips[0].id);
    }
  }, [selectedTripId, trips]);

  useEffect(() => {
    if (!selectedTrip) {
      return;
    }

    void loadPackingList(selectedTrip.id);
  }, [selectedTrip]);

  async function loadTrips() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/trips");
      const data = (await response.json()) as TripsResponse;
      setTrips(data.trips);
      setSelectedTripId((current) => current ?? data.trips[0]?.id ?? null);
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
    setPackingList(data.packingList);
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
      await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await loadTrips();
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
      await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          event: payload
        })
      });
      await loadTrips();
      await loadPackingList(selectedTrip.id);
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
      await fetch("/api/calendar/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: selectedTrip.id, source: "google-calendar" })
      });
      await loadTrips();
      await loadPackingList(selectedTrip.id);
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
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader />

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
              <PackingListCard items={packingList} />
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
