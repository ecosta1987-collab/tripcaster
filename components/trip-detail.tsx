"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarRange,
  CarFront,
  ChevronDown,
  ChevronUp,
  Clock3,
  CloudSun,
  Luggage,
  MapPinned,
  Pencil,
  Plane,
  Plus,
  Trash2
} from "lucide-react";
import type {
  AgendaItem,
  CarRental,
  FlightSegment,
  PackingSection,
  TimeReference,
  Trip,
  TripResponse,
  TripStep
} from "@/lib/types";

const tabs = [
  { id: "steps", label: "Steps" },
  { id: "weather", label: "Weather Forecast" },
  { id: "travel", label: "Travel" },
  { id: "agenda", label: "Agenda" },
  { id: "packing", label: "Packing List" }
] as const;

type TabId = (typeof tabs)[number]["id"];

type TripDetailProps = {
  tripId: string;
  userName: string;
  initialTab?: string;
};

async function patchTrip(tripId: string, patch: Record<string, unknown>) {
  const response = await fetch(`/api/trips/${tripId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });

  const data = (await response.json()) as TripResponse | { error?: string };

  if (!response.ok || !("trip" in data)) {
    throw new Error(("error" in data && data.error) || "Unable to update trip.");
  }

  return data.trip;
}

function formatLocalNow(timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
  } catch {
    return "Time unavailable";
  }
}

function StepEditor({
  initialStep,
  submitLabel,
  onSubmit,
  onCancel,
  isLoading
}: {
  initialStep?: TripStep;
  submitLabel: string;
  onSubmit: (step: TripStep) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}) {
  async function handleSubmit(formData: FormData) {
    await onSubmit({
      id: initialStep?.id ?? crypto.randomUUID(),
      destination: String(formData.get("destination") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      timezone: initialStep?.timezone ?? "UTC",
      stayType: String(formData.get("stayType") ?? "hotel") as TripStep["stayType"],
      stayName: String(formData.get("stayName") ?? "") || null,
      stayProvider: String(formData.get("stayProvider") ?? "") || null,
      stayProviderUrl: String(formData.get("stayProviderUrl") ?? "") || null,
      stayNotes: String(formData.get("stayNotes") ?? "") || null
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-3xl border border-ink/10 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Destination
          <input
            name="destination"
            required
            defaultValue={initialStep?.destination}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Stay type
          <select
            name="stayType"
            defaultValue={initialStep?.stayType ?? "hotel"}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
          >
            <option value="hotel">Hotel</option>
            <option value="flight">Night in flight</option>
            <option value="other">Other stay</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Start date
          <input
            name="startDate"
            type="date"
            required
            defaultValue={initialStep?.startDate}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          End date
          <input
            name="endDate"
            type="date"
            required
            defaultValue={initialStep?.endDate}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Stay name
          <input
            name="stayName"
            defaultValue={initialStep?.stayName ?? ""}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Provider
          <input
            name="stayProvider"
            defaultValue={initialStep?.stayProvider ?? ""}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
          />
        </label>
      </div>

      <label className="text-sm font-medium text-ink">
        Provider URL
        <input
          name="stayProviderUrl"
          defaultValue={initialStep?.stayProviderUrl ?? ""}
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
        />
      </label>

      <label className="text-sm font-medium text-ink">
        Notes
        <textarea
          name="stayNotes"
          rows={2}
          defaultValue={initialStep?.stayNotes ?? ""}
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-sky"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-medium text-ink"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function TripDetail({ tripId, userName, initialTab }: TripDetailProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedStepIds, setExpandedStepIds] = useState<string[]>([]);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [showNewStepForm, setShowNewStepForm] = useState(false);
  const [packingMode, setPackingMode] = useState<"trip" | "day">("trip");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") ?? initialTab ?? "steps") as TabId;

  useEffect(() => {
    void loadTrip();
  }, [tripId]);

  async function loadTrip() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}`);
      const data = (await response.json()) as TripResponse | { error?: string };

      if (!response.ok || !("trip" in data)) {
        throw new Error(("error" in data && data.error) || "Unable to load trip.");
      }

      setTrip(data.trip);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load trip.");
    } finally {
      setIsLoading(false);
    }
  }

  async function applyPatch(patch: Record<string, unknown>) {
    setIsLoading(true);
    try {
      const nextTrip = await patchTrip(tripId, patch);
      setTrip(nextTrip);
      setError(null);
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : "Unable to update trip.");
    } finally {
      setIsLoading(false);
    }
  }

  function goToTab(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function toggleStep(stepId: string) {
    setExpandedStepIds((current) =>
      current.includes(stepId) ? current.filter((id) => id !== stepId) : [...current, stepId]
    );
  }

  async function handleAddStep(step: TripStep) {
    if (!trip) {
      return;
    }

    await applyPatch({
      steps: [...trip.steps, step]
    });
    setShowNewStepForm(false);
    setExpandedStepIds((current) => [...current, step.id]);
  }

  async function handleUpdateStep(updatedStep: TripStep) {
    if (!trip) {
      return;
    }

    await applyPatch({
      steps: trip.steps.map((step) => (step.id === updatedStep.id ? updatedStep : step))
    });
    setEditingStepId(null);
  }

  async function handleDeleteStep(stepId: string) {
    if (!trip || trip.steps.length <= 1 || !window.confirm("Delete this step?")) {
      return;
    }

    await applyPatch({
      steps: trip.steps.filter((step) => step.id !== stepId)
    });
  }

  async function handleAddCar(formData: FormData) {
    if (!trip) {
      return;
    }

    const car: CarRental = {
      id: crypto.randomUUID(),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      company: String(formData.get("company") ?? ""),
      pickupAddress: String(formData.get("pickupAddress") ?? ""),
      sameReturnAddress: formData.get("sameReturnAddress") === "on",
      returnAddress: String(formData.get("returnAddress") ?? ""),
      carType: String(formData.get("carType") ?? "")
    };

    const returnAddress = car.sameReturnAddress ? car.pickupAddress : car.returnAddress;

    await applyPatch({
      travelCars: [...trip.travel.cars, { ...car, returnAddress }]
    });
  }

  async function handleAddFlight(formData: FormData) {
    if (!trip) {
      return;
    }

    const flight: FlightSegment = {
      id: crypto.randomUUID(),
      flightNumber: String(formData.get("flightNumber") ?? ""),
      seat: String(formData.get("seat") ?? ""),
      carrier: String(formData.get("carrier") ?? ""),
      departureAirport: String(formData.get("departureAirport") ?? ""),
      arrivalAirport: String(formData.get("arrivalAirport") ?? ""),
      departureLocal: String(formData.get("departureLocal") ?? ""),
      arrivalLocal: String(formData.get("arrivalLocal") ?? ""),
      arrivalDestinationTime: String(formData.get("arrivalDestinationTime") ?? "")
    };

    await applyPatch({
      flightSegments: [...trip.travel.flights, flight]
    });
  }

  async function handleAddAgendaItem(formData: FormData) {
    if (!trip) {
      return;
    }

    const item: AgendaItem = {
      id: crypto.randomUUID(),
      date: String(formData.get("date") ?? ""),
      title: String(formData.get("title") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      type: String(formData.get("type") ?? "meeting") as AgendaItem["type"],
      startTime: String(formData.get("startTime") ?? "") || null,
      endTime: String(formData.get("endTime") ?? "") || null,
      timeReference: String(formData.get("timeReference") ?? "local") as TimeReference
    };

    await applyPatch({
      agendaItems: [...trip.agenda, item]
    });
  }

  async function handleDeleteAgendaItem(itemId: string) {
    if (!trip || !window.confirm("Delete this agenda item?")) {
      return;
    }

    await applyPatch({
      agendaItems: trip.agenda.filter((item) => item.id !== itemId)
    });
  }

  async function handleAddPackingSection(formData: FormData) {
    if (!trip) {
      return;
    }

    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
      return;
    }

    await applyPatch({
      packingSections: [...trip.packingSections, { id: crypto.randomUUID(), name, items: [] }]
    });
  }

  async function handleAddPackingItem(sectionId: string, formData: FormData) {
    if (!trip) {
      return;
    }

    const label = String(formData.get("label") ?? "").trim();
    const day = String(formData.get("day") ?? "").trim() || null;
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!label) {
      return;
    }

    const nextSections = trip.packingSections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            items: [...section.items, { id: crypto.randomUUID(), label, day, notes }]
          }
        : section
    );

    await applyPatch({ packingSections: nextSections });
  }

  const agendaByDate = useMemo(() => {
    if (!trip) {
      return [];
    }

    return trip.weatherByDay.map((day) => ({
      ...day,
      agenda: trip.agenda.filter((item) => item.date === day.date)
    }));
  }, [trip]);

  if (error && !trip) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-ink/60 sm:px-6 lg:px-8">
        Loading trip...
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/my-trips" className="text-sm font-medium text-ink/60 transition hover:text-ink">
            Back to all trips
          </Link>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">{trip.title}</h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-ink/70">
            {trip.description || trip.placeInfo.summary}
          </p>
        </div>
        <div className="rounded-3xl border border-ink/10 bg-white px-5 py-4 text-sm text-ink/65">
          <p className="font-medium text-ink">{userName}</p>
          <p className="mt-1">
            {trip.startDate} to {trip.endDate}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white/85 shadow-lg shadow-ink/5">
        <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
          <div className="h-72 bg-[#dbe8ef]">
            <img src={trip.placeInfo.imageUrl} alt={trip.destination} className="h-full w-full object-cover" />
          </div>
          <div className="p-8">
            <div className="flex flex-wrap gap-3">
              {trip.placeInfo.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-ink/10 bg-[#fffdf8] px-3 py-1 text-xs text-ink/65"
                >
                  {highlight}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
                <MapPinned className="h-5 w-5 text-coral" />
                <p className="mt-3 text-sm text-ink/60">Route</p>
                <p className="text-base font-semibold text-ink">{trip.destination}</p>
              </div>
              <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
                <CalendarRange className="h-5 w-5 text-mint" />
                <p className="mt-3 text-sm text-ink/60">Dates</p>
                <p className="text-base font-semibold text-ink">
                  {trip.startDate} to {trip.endDate}
                </p>
              </div>
              <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
                <Clock3 className="h-5 w-5 text-sky" />
                <p className="mt-3 text-sm text-ink/60">Primary timezone</p>
                <p className="text-base font-semibold text-ink">{trip.timezone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => goToTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-ink text-white"
                : "border border-ink/10 bg-white text-ink/70 hover:bg-[#fffdf8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {activeTab === "steps" ? (
        <section className="space-y-4">
          {trip.steps.map((step, index) => {
            const expanded = expandedStepIds.includes(step.id);
            const editing = editingStepId === step.id;

            return (
              <article key={step.id} className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Step {index + 1}</p>
                    <p className="mt-1 text-xl font-semibold text-ink">{step.destination}</p>
                    <p className="mt-2 text-sm text-ink/60">
                      {step.startDate} to {step.endDate}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink"
                    >
                      <Plus className={`h-4 w-4 transition ${expanded ? "rotate-45" : ""}`} />
                      {expanded ? "Collapse" : "Expand"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStepId(editing ? null : step.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteStep(step.id)}
                      disabled={isLoading || trip.steps.length <= 1}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
                      <p className="text-sm text-ink/60">Stay</p>
                      <p className="mt-2 font-semibold text-ink">{step.stayName || "Not set"}</p>
                      <p className="mt-1 text-sm text-ink/60">{step.stayType}</p>
                    </div>
                    <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
                      <p className="text-sm text-ink/60">Timezone</p>
                      <p className="mt-2 font-semibold text-ink">{step.timezone}</p>
                      <p className="mt-1 text-sm text-ink/60">{formatLocalNow(step.timezone)}</p>
                    </div>
                    <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
                      <p className="text-sm text-ink/60">Notes</p>
                      <p className="mt-2 text-sm text-ink/70">{step.stayNotes || "No notes yet."}</p>
                    </div>
                  </div>
                ) : null}

                {editing ? (
                  <div className="mt-5">
                    <StepEditor
                      initialStep={step}
                      submitLabel="Save step"
                      onSubmit={handleUpdateStep}
                      onCancel={() => setEditingStepId(null)}
                      isLoading={isLoading}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}

          {showNewStepForm ? (
            <StepEditor
              submitLabel="Add step"
              onSubmit={handleAddStep}
              onCancel={() => setShowNewStepForm(false)}
              isLoading={isLoading}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNewStepForm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Add new step
            </button>
          )}
        </section>
      ) : null}

      {activeTab === "weather" ? (
        <section className="space-y-4">
          {trip.weatherByDay.map((day) => (
            <article key={day.date} className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{day.date}</p>
                  <p className="mt-1 text-xl font-semibold text-ink">{day.destination}</p>
                  <p className="mt-2 text-sm text-ink/60">{day.timezone}</p>
                </div>
                <CloudSun className="h-6 w-6 text-sky" />
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/70">{day.summary}</p>
              {day.available ? (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4 text-sm text-ink/70">
                    Temperature: {day.lowTempC}C to {day.highTempC}C
                  </div>
                  <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4 text-sm text-ink/70">
                    Rain chance: {day.rainChance}%
                  </div>
                  <div className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4 text-sm text-ink/70">
                    {day.note}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {activeTab === "travel" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
            <div className="flex items-center gap-2">
              <CarFront className="h-5 w-5 text-coral" />
              <h2 className="text-2xl font-semibold text-ink">Rental Cars</h2>
            </div>
            <div className="mt-6 space-y-3">
              {trip.travel.cars.map((car) => (
                <div key={car.id} className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4 text-sm text-ink/70">
                  <p className="font-semibold text-ink">{car.company}</p>
                  <p className="mt-1">
                    {car.startDate} to {car.endDate}
                  </p>
                  <p className="mt-1">Pickup: {car.pickupAddress}</p>
                  <p className="mt-1">Return: {car.returnAddress}</p>
                  <p className="mt-1">Car: {car.carType}</p>
                </div>
              ))}
              {!trip.travel.cars.length ? (
                <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 p-4 text-sm text-ink/60">
                  No rental cars yet.
                </div>
              ) : null}
            </div>

            <form action={handleAddCar} className="mt-6 grid gap-4 rounded-3xl border border-ink/10 bg-white p-5">
              <input name="company" placeholder="Rental company" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              <div className="grid gap-4 md:grid-cols-2">
                <input name="startDate" type="date" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <input name="endDate" type="date" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              </div>
              <input name="pickupAddress" placeholder="Pickup address" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input name="sameReturnAddress" type="checkbox" />
                Return to the same address
              </label>
              <input name="returnAddress" placeholder="Return address" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              <input name="carType" placeholder="Type of car" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Add rental car</button>
            </form>
          </section>

          <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky" />
              <h2 className="text-2xl font-semibold text-ink">Flights</h2>
            </div>
            <div className="mt-6 space-y-3">
              {trip.travel.flights.map((flight) => (
                <div key={flight.id} className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4 text-sm text-ink/70">
                  <p className="font-semibold text-ink">
                    {flight.carrier} {flight.flightNumber}
                  </p>
                  <p className="mt-1">Seat: {flight.seat || "Not set"}</p>
                  <p className="mt-1">
                    {flight.departureAirport} to {flight.arrivalAirport}
                  </p>
                  <p className="mt-1">Departure local: {flight.departureLocal}</p>
                  <p className="mt-1">Arrival local: {flight.arrivalLocal}</p>
                  <p className="mt-1">Arrival at destination time: {flight.arrivalDestinationTime}</p>
                </div>
              ))}
              {!trip.travel.flights.length ? (
                <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 p-4 text-sm text-ink/60">
                  No flights yet.
                </div>
              ) : null}
            </div>

            <form action={handleAddFlight} className="mt-6 grid gap-4 rounded-3xl border border-ink/10 bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input name="carrier" placeholder="Carrier" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <input name="flightNumber" placeholder="Flight number" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input name="departureAirport" placeholder="Departure airport" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <input name="arrivalAirport" placeholder="Arrival airport" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <input name="departureLocal" placeholder="Departure local time" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <input name="arrivalLocal" placeholder="Arrival local time" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <input name="arrivalDestinationTime" placeholder="Arrival destination time" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              </div>
              <input name="seat" placeholder="Seat" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Add flight</button>
            </form>
          </section>
        </section>
      ) : null}

      {activeTab === "agenda" ? (
        <section className="space-y-6">
          <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
            <h2 className="text-2xl font-semibold text-ink">Agenda timeline</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              Add events or general day information. Time can be entered in local trip time or in your home timezone (Rome).
            </p>

            <form action={handleAddAgendaItem} className="mt-6 grid gap-4 rounded-3xl border border-ink/10 bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input name="title" placeholder="Event title" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <input name="date" type="date" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <input name="startTime" type="time" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <input name="endTime" type="time" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
                <select name="type" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none">
                  <option value="meeting">Meeting</option>
                  <option value="flight">Flight</option>
                  <option value="dinner">Dinner</option>
                  <option value="workshop">Workshop</option>
                  <option value="note">General note</option>
                </select>
                <select name="timeReference" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none">
                  <option value="local">Local time</option>
                  <option value="home">Home time (Rome)</option>
                </select>
              </div>
              <textarea name="notes" rows={3} placeholder="Details or day note" className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none" />
              <button type="submit" className="w-fit rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">Add agenda item</button>
            </form>
          </section>

          {agendaByDate.map((day) => (
            <article key={day.date} className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{day.date}</p>
                  <p className="mt-1 text-xl font-semibold text-ink">{day.destination}</p>
                </div>
                <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ink/60">
                  {day.agenda.length} {day.agenda.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {day.agenda.length ? (
                  day.agenda.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{item.title}</p>
                          <p className="mt-1 text-sm text-ink/60">
                            {item.startTime ? `${item.startTime} - ${item.endTime || ""}` : "All-day note"} • {item.timeReference === "home" ? "Rome time" : "Local time"}
                          </p>
                          {item.notes ? <p className="mt-2 text-sm text-ink/70">{item.notes}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDeleteAgendaItem(item.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-ink/15 bg-white/70 p-4 text-sm text-ink/60">
                    No agenda items for this day yet.
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {activeTab === "packing" ? (
        <section className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPackingMode("trip")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                packingMode === "trip" ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink/70"
              }`}
            >
              Entire trip
            </button>
            <button
              type="button"
              onClick={() => setPackingMode("day")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                packingMode === "day" ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink/70"
              }`}
            >
              By day
            </button>
          </div>

          <section className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
            <form action={handleAddPackingSection} className="flex flex-wrap gap-3">
              <input
                name="name"
                placeholder="Add custom section"
                className="min-w-[260px] flex-1 rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none"
              />
              <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
                Add section
              </button>
            </form>
          </section>

          {trip.packingSections.map((section) => (
            <article key={section.id} className="rounded-[1.75rem] border border-ink/10 bg-white/85 p-6 shadow-lg shadow-ink/5">
              <div className="flex items-center gap-2">
                <Luggage className="h-5 w-5 text-coral" />
                <h2 className="text-2xl font-semibold text-ink">{section.name}</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {section.items
                  .filter((item) => (packingMode === "trip" ? true : Boolean(item.day)))
                  .map((item) => (
                    <div key={item.id} className="rounded-3xl border border-ink/10 bg-[#fffdf8] p-4 text-sm text-ink/70">
                      <p className="font-medium text-ink">{item.label}</p>
                      {item.day ? <p className="mt-1">Day: {item.day}</p> : null}
                      {item.notes ? <p className="mt-1">{item.notes}</p> : null}
                    </div>
                  ))}
              </div>
              <form
                action={(formData) => void handleAddPackingItem(section.id, formData)}
                className="mt-5 grid gap-4 rounded-3xl border border-ink/10 bg-white p-5"
              >
                <input
                  name="label"
                  placeholder="Add packing item"
                  className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="day"
                    type="date"
                    className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none"
                  />
                  <input
                    name="notes"
                    placeholder="Notes or agenda summary"
                    className="rounded-2xl border border-ink/10 bg-[#fffdf8] px-4 py-3 text-sm outline-none"
                  />
                </div>
                <button type="submit" className="w-fit rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
                  Add item
                </button>
              </form>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
