import { Plus } from "lucide-react";

type TripFormProps = {
  onCreateTrip: (trip: {
    destination: string;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  isLoading: boolean;
};

export function TripForm({ onCreateTrip, isLoading }: TripFormProps) {
  async function handleSubmit(formData: FormData) {
    await onCreateTrip({
      destination: String(formData.get("destination") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? "")
    });
  }

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/45">New Trip</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Create an itinerary</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Start with destination and dates. The mock backend will attach timezone, forecast, and
        suggestions automatically.
      </p>

      <form action={handleSubmit} className="mt-6 grid gap-4">
        <label className="text-sm font-medium text-ink">
          Destination
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
  );
}
