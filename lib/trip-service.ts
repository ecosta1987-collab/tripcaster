import { EventType as PrismaEventType, PackingStyle, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import {
  AgendaItem,
  CarRental,
  EventType,
  FlightSegment,
  PackingSection,
  PlaceInfo,
  Trip,
  TripStep,
  TripsResponse,
  UserPreference
} from "@/lib/types";
import {
  buildAgendaSummaryByDay,
  buildDailyForecast,
  buildOverviewPlaceInfo,
  buildPackingSections,
  flattenPackingSections,
  getDestinationProfile,
  getWeatherSummary,
  importMockEvents
} from "@/lib/travel";

type TripColumns = {
  title: boolean;
  description: boolean;
  placeInfo: boolean;
  steps: boolean;
  travelCars: boolean;
  flightSegments: boolean;
  agendaItems: boolean;
  packingSections: boolean;
};

type TripEventRecord = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: PrismaEventType;
};

type PackingItemRecord = {
  id: string;
  label: string;
};

type TripRecord = {
  id: string;
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string | null;
  description?: string | null;
  placeInfo?: Prisma.JsonValue | null;
  steps?: Prisma.JsonValue | null;
  travelCars?: Prisma.JsonValue | null;
  flightSegments?: Prisma.JsonValue | null;
  agendaItems?: Prisma.JsonValue | null;
  packingSections?: Prisma.JsonValue | null;
  events: TripEventRecord[];
  packingItems: PackingItemRecord[];
};

type TripPatch = {
  title?: string;
  description?: string | null;
  steps?: TripStep[];
  travelCars?: CarRental[];
  flightSegments?: FlightSegment[];
  agendaItems?: AgendaItem[];
  packingSections?: PackingSection[];
};

let tripColumnsPromise: Promise<TripColumns> | null = null;

function mapPreferences(preference: {
  homeTimezone: string;
  favoriteAirport: string | null;
  packingStyle: PackingStyle;
}): UserPreference {
  return {
    homeTimezone: preference.homeTimezone,
    favoriteAirport: preference.favoriteAirport,
    packingStyle: preference.packingStyle.toLowerCase() as UserPreference["packingStyle"]
  };
}

function parseJsonField<T>(value: Prisma.JsonValue | null | undefined, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }

  return value as T;
}

async function getTripColumns(): Promise<TripColumns> {
  if (!tripColumnsPromise) {
    tripColumnsPromise = prisma
      .$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Trip'
      `
      .then((rows) => {
        const names = new Set(rows.map((row) => row.column_name));

        return {
          title: names.has("title"),
          description: names.has("description"),
          placeInfo: names.has("placeInfo"),
          steps: names.has("steps"),
          travelCars: names.has("travelCars"),
          flightSegments: names.has("flightSegments"),
          agendaItems: names.has("agendaItems"),
          packingSections: names.has("packingSections")
        };
      })
      .catch(() => ({
        title: false,
        description: false,
        placeInfo: false,
        steps: false,
        travelCars: false,
        flightSegments: false,
        agendaItems: false,
        packingSections: false
      }));
  }

  return tripColumnsPromise;
}

function buildTripSelect(columns: TripColumns) {
  return {
    id: true,
    userId: true,
    destination: true,
    startDate: true,
    endDate: true,
    timezone: true,
    createdAt: true,
    updatedAt: true,
    ...(columns.title ? { title: true } : {}),
    ...(columns.description ? { description: true } : {}),
    ...(columns.placeInfo ? { placeInfo: true } : {}),
    ...(columns.steps ? { steps: true } : {}),
    ...(columns.travelCars ? { travelCars: true } : {}),
    ...(columns.flightSegments ? { flightSegments: true } : {}),
    ...(columns.agendaItems ? { agendaItems: true } : {}),
    ...(columns.packingSections ? { packingSections: true } : {}),
    events: {
      orderBy: [{ date: "asc" }, { startTime: "asc" }]
    },
    packingItems: {
      orderBy: { label: "asc" }
    }
  } satisfies Prisma.TripSelect;
}

function buildLegacyStep(record: TripRecord): TripStep {
  return {
    id: `legacy-step-${record.id}`,
    destination: record.destination,
    startDate: record.startDate.toISOString().slice(0, 10),
    endDate: record.endDate.toISOString().slice(0, 10),
    timezone: record.timezone,
    stayType: "hotel",
    stayName: null,
    stayProvider: null,
    stayProviderUrl: null,
    stayNotes: null
  };
}

function normalizeSteps(record: TripRecord): TripStep[] {
  const storedSteps = parseJsonField<TripStep[]>(record.steps, []);

  if (storedSteps.length) {
    return storedSteps;
  }

  return [buildLegacyStep(record)];
}

function normalizeAgenda(record: TripRecord): AgendaItem[] {
  const storedAgenda = parseJsonField<AgendaItem[]>(record.agendaItems, []);

  if (storedAgenda.length) {
    return storedAgenda;
  }

  return record.events.map((event) => ({
    id: event.id,
    date: event.date.toISOString().slice(0, 10),
    title: event.title,
    notes: "",
    type: event.type.toLowerCase() as EventType,
    startTime: event.startTime,
    endTime: event.endTime,
    timeReference: "local"
  }));
}

function buildDateRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  let cursor = new Date(`${startDate}T00:00:00.000Z`);
  const finalDate = new Date(`${endDate}T00:00:00.000Z`);

  while (cursor <= finalDate) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function normalizePackingSections(
  record: TripRecord,
  preferences: UserPreference,
  primaryDestination: string
) {
  const storedSections = parseJsonField<PackingSection[]>(record.packingSections, []);

  if (storedSections.length) {
    return storedSections;
  }

  if (record.packingItems.length) {
    return [
      {
        id: "legacy",
        name: "Suggested",
        items: record.packingItems.map((item) => ({
          id: item.id,
          label: item.label,
          day: null,
          notes: null
        }))
      }
    ];
  }

  const agenda = normalizeAgenda(record);
  const tripDates = buildDateRange(
    record.startDate.toISOString().slice(0, 10),
    record.endDate.toISOString().slice(0, 10)
  );

  return buildPackingSections({
    destination: primaryDestination,
    eventTypes: agenda.map((entry) => entry.type),
    packingStyle: preferences.packingStyle,
    tripDates
  });
}

function mapTrip(record: TripRecord, preferences: UserPreference): Trip {
  const steps = normalizeSteps(record);
  const destinations = steps.map((step) => step.destination);
  const primaryDestination = destinations[0] ?? record.destination;
  const placeInfo =
    parseJsonField<PlaceInfo | null>(record.placeInfo, null) ??
    buildOverviewPlaceInfo(destinations);
  const agenda = normalizeAgenda(record);
  const packingSections = normalizePackingSections(record, preferences, primaryDestination).map(
    (section) => ({
      ...section,
      items: section.items.map((item) =>
        item.day
          ? { ...item, notes: item.notes ?? buildAgendaSummaryByDay(item.day, agenda) }
          : item
      )
    })
  );
  const weatherByDay = buildDailyForecast({
    tripStartDate: record.startDate.toISOString().slice(0, 10),
    tripEndDate: record.endDate.toISOString().slice(0, 10),
    steps
  });

  return {
    id: record.id,
    title: record.title || primaryDestination,
    description: record.description ?? null,
    destination: destinations.join(" -> ") || record.destination,
    startDate: record.startDate.toISOString().slice(0, 10),
    endDate: record.endDate.toISOString().slice(0, 10),
    timezone: steps[0]?.timezone ?? record.timezone,
    homeTimezone: preferences.homeTimezone,
    placeInfo,
    steps,
    weatherOverview: getWeatherSummary(primaryDestination),
    weatherByDay,
    travel: {
      cars: parseJsonField<CarRental[]>(record.travelCars, []),
      flights: parseJsonField<FlightSegment[]>(record.flightSegments, [])
    },
    agenda,
    packingSections,
    events: agenda,
    packingList: flattenPackingSections(packingSections),
    weather: getWeatherSummary(primaryDestination)
  };
}

async function ensurePreferences(userId: string) {
  return prisma.preference.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });
}

async function findOwnedTrip(userId: string, tripId: string) {
  const columns = await getTripColumns();

  return prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: buildTripSelect(columns)
  }) as Promise<TripRecord | null>;
}

async function listOwnedTrips(userId: string) {
  const columns = await getTripColumns();

  return prisma.trip.findMany({
    where: { userId },
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    select: buildTripSelect(columns)
  }) as Promise<TripRecord[]>;
}

async function buildMappedTrip(userId: string, tripId: string) {
  const preferenceRecord = await ensurePreferences(userId);
  const trip = await findOwnedTrip(userId, tripId);

  if (!trip) {
    return null;
  }

  return mapTrip(trip, mapPreferences(preferenceRecord));
}

function normalizeStepPayload(step: Partial<TripStep>) {
  const destination = step.destination?.trim();
  const startDate = step.startDate;
  const endDate = step.endDate;

  if (!destination || !startDate || !endDate) {
    throw new Error("Each step needs a destination and dates.");
  }

  const profile = getDestinationProfile(destination);

  return {
    id: step.id ?? randomUUID(),
    destination,
    startDate,
    endDate,
    timezone: profile.timezone,
    stayType: step.stayType ?? "hotel",
    stayName: step.stayName?.trim() || null,
    stayProvider: step.stayProvider?.trim() || null,
    stayProviderUrl: step.stayProviderUrl?.trim() || null,
    stayNotes: step.stayNotes?.trim() || null
  } satisfies TripStep;
}

function normalizeAgendaPayload(item: Partial<AgendaItem>) {
  if (!item.date || !item.title?.trim()) {
    throw new Error("Agenda items need a date and title.");
  }

  return {
    id: item.id ?? randomUUID(),
    date: item.date,
    title: item.title.trim(),
    notes: item.notes?.trim() || "",
    type: item.type ?? "meeting",
    startTime: item.startTime || null,
    endTime: item.endTime || null,
    timeReference: item.timeReference ?? "local"
  } satisfies AgendaItem;
}

function syncSummaryFields(patch: TripPatch, currentTrip: TripRecord) {
  const steps = patch.steps ?? normalizeSteps(currentTrip);
  const firstStep = steps[0] ?? buildLegacyStep(currentTrip);

  return {
    destination: steps.map((step) => step.destination).join(" -> ") || currentTrip.destination,
    timezone: firstStep.timezone,
    placeInfo:
      patch.steps || !currentTrip.placeInfo
        ? (buildOverviewPlaceInfo(steps.map((step) => step.destination)) as Prisma.InputJsonValue)
        : currentTrip.placeInfo,
    title: patch.title?.trim() || currentTrip.title || currentTrip.destination,
    description:
      patch.description === undefined
        ? (currentTrip.description ?? null)
        : patch.description?.trim() || null
  };
}

export async function listUserTrips(userId: string): Promise<TripsResponse> {
  const preferenceRecord = await ensurePreferences(userId);
  const preferences = mapPreferences(preferenceRecord);
  const trips = await listOwnedTrips(userId);

  return {
    preferences,
    trips: trips.map((trip) => mapTrip(trip, preferences))
  };
}

export async function getUserTrip(userId: string, tripId: string) {
  return buildMappedTrip(userId, tripId);
}

export async function createUserTrip(
  userId: string,
  input: {
    title?: string;
    description?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const destination = input.destination?.trim();
  const startDate = input.startDate;
  const endDate = input.endDate;

  if (!destination || !startDate || !endDate) {
    throw new Error("Destination and dates are required.");
  }

  const columns = await getTripColumns();
  const preferenceRecord = await ensurePreferences(userId);
  const preferences = mapPreferences(preferenceRecord);
  const profile = getDestinationProfile(destination);
  const step = normalizeStepPayload({
    destination,
    startDate,
    endDate,
    stayType: "hotel"
  });
  const packingSections = buildPackingSections({
    destination,
    eventTypes: [],
    packingStyle: preferences.packingStyle,
    tripDates: buildDateRange(startDate, endDate)
  });

  const createdTrip = await prisma.trip.create({
    data: {
      userId,
      destination,
      startDate: new Date(`${startDate}T00:00:00.000Z`),
      endDate: new Date(`${endDate}T00:00:00.000Z`),
      timezone: profile.timezone,
      ...(columns.title ? { title: input.title?.trim() || destination } : {}),
      ...(columns.description ? { description: input.description?.trim() || null } : {}),
      ...(columns.placeInfo
        ? { placeInfo: buildOverviewPlaceInfo([destination]) as Prisma.InputJsonValue }
        : {}),
      ...(columns.steps ? { steps: [step] as Prisma.InputJsonValue } : {}),
      ...(columns.travelCars ? { travelCars: [] as Prisma.InputJsonValue } : {}),
      ...(columns.flightSegments ? { flightSegments: [] as Prisma.InputJsonValue } : {}),
      ...(columns.agendaItems ? { agendaItems: [] as Prisma.InputJsonValue } : {}),
      ...(columns.packingSections
        ? { packingSections: packingSections as Prisma.InputJsonValue }
        : {})
    },
    select: buildTripSelect(columns)
  });

  return mapTrip(createdTrip as TripRecord, preferences);
}

export async function updateUserTrip(userId: string, tripId: string, patch: TripPatch) {
  const columns = await getTripColumns();
  const trip = await findOwnedTrip(userId, tripId);

  if (!trip) {
    return null;
  }

  const nextSteps = patch.steps?.map((step) => normalizeStepPayload(step)) ?? undefined;
  const nextAgenda = patch.agendaItems?.map((item) => normalizeAgendaPayload(item)) ?? undefined;
  const summary = syncSummaryFields(
    {
      ...patch,
      steps: nextSteps
    },
    trip
  );

  await prisma.trip.update({
    where: { id: tripId },
    data: {
      destination: summary.destination,
      timezone: summary.timezone,
      ...(columns.title ? { title: summary.title } : {}),
      ...(columns.description ? { description: summary.description } : {}),
      ...(columns.placeInfo ? { placeInfo: summary.placeInfo as Prisma.InputJsonValue } : {}),
      ...(columns.steps && nextSteps ? { steps: nextSteps as Prisma.InputJsonValue } : {}),
      ...(columns.travelCars && patch.travelCars
        ? { travelCars: patch.travelCars as Prisma.InputJsonValue }
        : {}),
      ...(columns.flightSegments && patch.flightSegments
        ? { flightSegments: patch.flightSegments as Prisma.InputJsonValue }
        : {}),
      ...(columns.agendaItems && nextAgenda
        ? { agendaItems: nextAgenda as Prisma.InputJsonValue }
        : {}),
      ...(columns.packingSections && patch.packingSections
        ? { packingSections: patch.packingSections as Prisma.InputJsonValue }
        : {})
    }
  });

  return buildMappedTrip(userId, tripId);
}

export async function addEventToUserTrip(
  userId: string,
  tripId: string,
  input: {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    type?: EventType;
  }
) {
  const trip = await findOwnedTrip(userId, tripId);

  if (!trip) {
    return null;
  }

  const agenda = normalizeAgenda(trip);
  const nextAgenda = [
    ...agenda,
    normalizeAgendaPayload({
      id: randomUUID(),
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      type: input.type,
      timeReference: "local"
    })
  ];

  return updateUserTrip(userId, tripId, { agendaItems: nextAgenda });
}

export async function importMockCalendarEvents(userId: string, tripId: string, source = "google-calendar") {
  const trip = await findOwnedTrip(userId, tripId);

  if (!trip) {
    return {
      source,
      importedCount: 0,
      trip: null
    };
  }

  const imported = importMockEvents(trip.startDate);
  const agenda = normalizeAgenda(trip);
  const nextAgenda = [
    ...agenda,
    ...imported.map((event) =>
      normalizeAgendaPayload({
        id: randomUUID(),
        title: event.title,
        date: event.date.toISOString().slice(0, 10),
        startTime: event.startTime,
        endTime: event.endTime,
        type: event.type,
        timeReference: "local"
      })
    )
  ];

  const updatedTrip = await updateUserTrip(userId, tripId, { agendaItems: nextAgenda });

  return {
    source,
    importedCount: imported.length,
    trip: updatedTrip
  };
}

export async function getWeatherForUserTrip(userId: string, tripId: string) {
  const trip = await buildMappedTrip(userId, tripId);

  if (!trip) {
    return null;
  }

  return trip.weatherOverview;
}

export async function rebuildPackingListForTrip(userId: string, tripId: string) {
  const trip = await buildMappedTrip(userId, tripId);

  if (!trip) {
    return null;
  }

  return flattenPackingSections(trip.packingSections);
}

export async function getUserPreferences(userId: string) {
  const preferenceRecord = await ensurePreferences(userId);
  return mapPreferences(preferenceRecord);
}

export async function updateUserPreferences(
  userId: string,
  input: {
    homeTimezone?: string;
    favoriteAirport?: string;
    packingStyle?: UserPreference["packingStyle"];
  }
) {
  const packingStyle = (input.packingStyle ?? "standard").toUpperCase() as PackingStyle;
  const updated = await prisma.preference.upsert({
    where: { userId },
    update: {
      homeTimezone: input.homeTimezone?.trim() || "Europe/Rome",
      favoriteAirport: input.favoriteAirport?.trim() || null,
      packingStyle
    },
    create: {
      userId,
      homeTimezone: input.homeTimezone?.trim() || "Europe/Rome",
      favoriteAirport: input.favoriteAirport?.trim() || null,
      packingStyle
    }
  });

  return mapPreferences(updated);
}
