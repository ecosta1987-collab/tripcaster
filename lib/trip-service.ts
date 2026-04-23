import { EventType as PrismaEventType, PackingStyle, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  EventType,
  Trip,
  TripEvent,
  TripsResponse,
  UserPreference
} from "@/lib/types";
import { buildPackingList, getDestinationProfile, getWeatherSummary, importMockEvents } from "@/lib/travel";

const tripInclude = {
  events: {
    orderBy: [{ date: "asc" }, { startTime: "asc" }]
  },
  packingItems: {
    orderBy: { label: "asc" }
  }
} satisfies Prisma.TripInclude;

type TripRecord = Prisma.TripGetPayload<{
  include: typeof tripInclude;
}>;

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

function mapTrip(record: TripRecord, preferences: UserPreference): Trip {
  return {
    id: record.id,
    destination: record.destination,
    startDate: record.startDate.toISOString().slice(0, 10),
    endDate: record.endDate.toISOString().slice(0, 10),
    timezone: record.timezone,
    homeTimezone: preferences.homeTimezone,
    weather: getWeatherSummary(record.destination),
    packingList: record.packingItems.map((item) => item.label),
    events: record.events.map<TripEvent>((event) => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString().slice(0, 10),
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type.toLowerCase() as EventType
    }))
  };
}

async function ensurePreferences(userId: string) {
  return prisma.preference.upsert({
    where: { userId },
    update: {},
    create: {
      userId
    }
  });
}

async function replacePackingItems(tripId: string, labels: string[]) {
  await prisma.$transaction([
    prisma.packingItem.deleteMany({
      where: { tripId }
    }),
    prisma.packingItem.createMany({
      data: labels.map((label) => ({
        tripId,
        label
      }))
    })
  ]);
}

async function findOwnedTrip(userId: string, tripId: string) {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      userId
    },
    include: tripInclude
  });
}

export async function listUserTrips(userId: string): Promise<TripsResponse> {
  const preferenceRecord = await ensurePreferences(userId);
  const preferences = mapPreferences(preferenceRecord);
  const trips = await prisma.trip.findMany({
    where: { userId },
    include: tripInclude,
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }]
  });

  return {
    preferences,
    trips: trips.map((trip) => mapTrip(trip, preferences))
  };
}

export async function createUserTrip(
  userId: string,
  input: { destination?: string; startDate?: string; endDate?: string }
) {
  const destination = input.destination?.trim();
  const startDate = input.startDate;
  const endDate = input.endDate;

  if (!destination || !startDate || !endDate) {
    throw new Error("Destination and dates are required.");
  }

  const preferenceRecord = await ensurePreferences(userId);
  const preferences = mapPreferences(preferenceRecord);
  const profile = getDestinationProfile(destination);
  const packingList = buildPackingList({
    destination,
    eventTypes: [],
    packingStyle: preferences.packingStyle
  });

  const trip = await prisma.trip.create({
    data: {
      userId,
      destination,
      startDate: new Date(`${startDate}T00:00:00.000Z`),
      endDate: new Date(`${endDate}T00:00:00.000Z`),
      timezone: profile.timezone,
      packingItems: {
        create: packingList.map((label) => ({ label }))
      }
    },
    include: tripInclude
  });

  return mapTrip(trip, preferences);
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

  if (!trip || !input.title || !input.date || !input.startTime || !input.endTime || !input.type) {
    return null;
  }

  await prisma.tripEvent.create({
    data: {
      tripId,
      title: input.title.trim(),
      date: new Date(`${input.date}T00:00:00.000Z`),
      startTime: input.startTime,
      endTime: input.endTime,
      type: input.type.toUpperCase() as PrismaEventType
    }
  });

  await rebuildPackingListForTrip(userId, tripId);

  const preferenceRecord = await ensurePreferences(userId);
  const updatedTrip = await findOwnedTrip(userId, tripId);

  if (!updatedTrip) {
    return null;
  }

  return mapTrip(updatedTrip, mapPreferences(preferenceRecord));
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

  await prisma.tripEvent.createMany({
    data: imported.map((event) => ({
      tripId,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type.toUpperCase() as PrismaEventType
    }))
  });

  await rebuildPackingListForTrip(userId, tripId);

  const preferenceRecord = await ensurePreferences(userId);
  const updatedTrip = await findOwnedTrip(userId, tripId);

  return {
    source,
    importedCount: imported.length,
    trip: updatedTrip ? mapTrip(updatedTrip, mapPreferences(preferenceRecord)) : null
  };
}

export async function getWeatherForUserTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId
    },
    select: {
      destination: true
    }
  });

  if (!trip) {
    return null;
  }

  return getWeatherSummary(trip.destination);
}

export async function rebuildPackingListForTrip(userId: string, tripId: string) {
  const preferenceRecord = await ensurePreferences(userId);
  const trip = await findOwnedTrip(userId, tripId);

  if (!trip) {
    return null;
  }

  const preferences = mapPreferences(preferenceRecord);
  const packingList = buildPackingList({
    destination: trip.destination,
    eventTypes: trip.events.map((event) => event.type.toLowerCase() as EventType),
    packingStyle: preferences.packingStyle
  });

  await replacePackingItems(tripId, packingList);
  return packingList;
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

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: {
      events: true
    }
  });

  await Promise.all(
    trips.map((trip) =>
      replacePackingItems(
        trip.id,
        buildPackingList({
          destination: trip.destination,
          eventTypes: trip.events.map((event) => event.type.toLowerCase() as EventType),
          packingStyle: packingStyle.toLowerCase() as UserPreference["packingStyle"]
        })
      )
    )
  );

  return mapPreferences(updated);
}
