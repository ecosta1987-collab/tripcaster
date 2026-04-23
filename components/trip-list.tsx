import { MapPinned } from "lucide-react";
import { Trip } from "@/lib/types";

type TripListProps = {
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string) => void;
};

export function TripList({ trips, selectedTripId, onSelectTrip }: TripListProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-ink/45">Trips</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Upcoming business travel</h2>
      </div>

      <div className="mt-6 grid gap-4">
        {trips.map((trip) => {
          const selected = trip.id === selectedTripId;
          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => onSelectTrip(trip.id)}
              className={`rounded-3xl border px-5 py-4 text-left transition ${
                selected
                  ? "border-sky bg-sky/10 shadow-md shadow-sky/10"
                  : "border-ink/10 bg-[#fffdf8] hover:border-sky/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-coral" />
                    <p className="text-lg font-semibold text-ink">{trip.destination}</p>
                  </div>
                  <p className="mt-2 text-sm text-ink/65">
                    {trip.startDate} to {trip.endDate}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ink/55">
                  {trip.timezone}
                </span>
              </div>
              <p className="mt-3 text-sm text-ink/65">
                {trip.events.length} events planned, forecast {trip.weather.summary.toLowerCase()}.
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
