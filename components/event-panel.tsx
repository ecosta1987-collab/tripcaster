import { CalendarPlus2, Download } from "lucide-react";
import { CalendarEvent, Trip } from "@/lib/types";

type EventPanelProps = {
  trip: Trip | null;
  onAddEvent: (event: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: CalendarEvent["type"];
  }) => Promise<void>;
  onImportEvents: () => Promise<void>;
  isLoading: boolean;
};

export function EventPanel({ trip, onAddEvent, onImportEvents, isLoading }: EventPanelProps) {
  async function handleSubmit(formData: FormData) {
    await onAddEvent({
      title: String(formData.get("title") ?? ""),
      date: String(formData.get("date") ?? ""),
      startTime: String(formData.get("startTime") ?? ""),
      endTime: String(formData.get("endTime") ?? ""),
      type: String(formData.get("type") ?? "meeting") as CalendarEvent["type"]
    });
  }

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/45">Calendar</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Events and imports</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Add key meetings manually or pull in a mocked calendar import for the active trip.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onImportEvents()}
          disabled={!trip || isLoading}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-sand px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Import mock events
        </button>
      </div>

      <form
        action={handleSubmit}
        className="mt-6 grid gap-4 rounded-3xl border border-dashed border-ink/15 bg-[#fffdf8] p-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Title
            <input
              name="title"
              required
              placeholder="Client workshop"
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-sky"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Date
            <input
              name="date"
              type="date"
              required
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-ink">
            Start
            <input
              name="startTime"
              type="time"
              required
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            End
            <input
              name="endTime"
              type="time"
              required
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Type
            <select
              name="type"
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky"
              defaultValue="meeting"
            >
              <option value="meeting">Meeting</option>
              <option value="flight">Flight</option>
              <option value="dinner">Dinner</option>
              <option value="workshop">Workshop</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={!trip || isLoading}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarPlus2 className="h-4 w-4" />
          Add event
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {trip?.events.length ? (
          trip.events.map((event) => (
            <article
              key={event.id}
              className="rounded-3xl border border-ink/10 bg-white px-5 py-4"
            >
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{event.title}</p>
                  <p className="text-sm text-ink/60">
                    {event.date} at {event.startTime} - {event.endTime}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-ink/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ink/60">
                  {event.type}
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 p-5 text-sm text-ink/60">
            Select a trip to manage events.
          </div>
        )}
      </div>
    </section>
  );
}
