import { CalendarEvent, EventType, Trip, WeatherSummary } from "@/lib/types";

const destinationProfiles: Record<
  string,
  { timezone: string; weather: WeatherSummary; basePacking: string[] }
> = {
  tokyo: {
    timezone: "Asia/Tokyo",
    weather: {
      summary: "Mild mornings with a chance of light rain later in the week.",
      highTempC: 21,
      lowTempC: 13,
      rainChance: 35,
      note: "Pack layers for commuter temperature swings."
    },
    basePacking: ["Light trench coat", "Compact umbrella", "Transit card holder"]
  },
  london: {
    timezone: "Europe/London",
    weather: {
      summary: "Cool, breezy conditions with scattered showers across the trip.",
      highTempC: 17,
      lowTempC: 9,
      rainChance: 60,
      note: "Bring a weather-resistant outer layer."
    },
    basePacking: ["Waterproof shoes", "Layering knit", "Foldable umbrella"]
  },
  new york: {
    timezone: "America/New_York",
    weather: {
      summary: "Warm afternoons and bright weather, with one evening thunder risk.",
      highTempC: 25,
      lowTempC: 16,
      rainChance: 25,
      note: "A blazer is enough for most outdoor transit."
    },
    basePacking: ["Sunglasses", "Portable charger", "Walking shoes"]
  },
  singapore: {
    timezone: "Asia/Singapore",
    weather: {
      summary: "Humid, hot days with short bursts of tropical rain.",
      highTempC: 31,
      lowTempC: 26,
      rainChance: 70,
      note: "Breathable fabrics will make the biggest difference."
    },
    basePacking: ["Breathable shirts", "Extra undershirts", "Mini umbrella"]
  }
};

const importedEventTemplates: CalendarEvent[] = [
  {
    id: "imported-1",
    title: "Airport transfer buffer",
    date: "2026-05-12",
    startTime: "08:30",
    endTime: "09:15",
    type: "flight"
  },
  {
    id: "imported-2",
    title: "Regional leadership dinner",
    date: "2026-05-12",
    startTime: "19:00",
    endTime: "21:00",
    type: "dinner"
  }
];

function shiftDate(isoDate: string, offsetDays: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

let trips: Trip[] = [
  {
    id: "trip-1",
    destination: "Tokyo",
    startDate: "2026-05-12",
    endDate: "2026-05-16",
    timezone: "Asia/Tokyo",
    homeTimezone: "Europe/Rome",
    events: [
      {
        id: "event-1",
        title: "Client kickoff",
        date: "2026-05-12",
        startTime: "10:00",
        endTime: "11:30",
        type: "meeting"
      },
      {
        id: "event-2",
        title: "Product workshop",
        date: "2026-05-13",
        startTime: "14:00",
        endTime: "16:00",
        type: "workshop"
      }
    ],
    weather: destinationProfiles.tokyo.weather
  },
  {
    id: "trip-2",
    destination: "London",
    startDate: "2026-06-03",
    endDate: "2026-06-06",
    timezone: "Europe/London",
    homeTimezone: "Europe/Rome",
    events: [
      {
        id: "event-3",
        title: "Board review",
        date: "2026-06-04",
        startTime: "09:00",
        endTime: "10:30",
        type: "meeting"
      }
    ],
    weather: destinationProfiles.london.weather
  }
];

function slugifyDestination(destination: string) {
  return destination.trim().toLowerCase();
}

function buildTripFromInput(input: {
  destination: string;
  startDate: string;
  endDate: string;
}): Trip {
  const slug = slugifyDestination(input.destination);
  const profile = destinationProfiles[slug] ?? {
    timezone: "UTC",
    weather: {
      summary: "Mock forecast pending provider setup. Expect moderate weather.",
      highTempC: 22,
      lowTempC: 14,
      rainChance: 20,
      note: "Treat this as placeholder data for now."
    },
    basePacking: ["Laptop charger", "Business cards", "Comfortable shoes"]
  };

  return {
    id: `trip-${Date.now()}`,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    timezone: profile.timezone,
    homeTimezone: "Europe/Rome",
    events: [],
    weather: profile.weather
  };
}

function appendEvent(tripId: string, event: Omit<CalendarEvent, "id">) {
  trips = trips.map((trip) =>
    trip.id === tripId
      ? {
          ...trip,
          events: [
            ...trip.events,
            {
              id: `event-${Date.now()}`,
              ...event
            }
          ]
        }
      : trip
  );

  return trips.find((trip) => trip.id === tripId) ?? null;
}

export function getTrips() {
  return trips;
}

export function createTrip(input: {
  destination?: string;
  startDate?: string;
  endDate?: string;
  tripId?: string;
  event?: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: EventType;
  };
}) {
  if (input.tripId && input.event) {
    return appendEvent(input.tripId, input.event);
  }

  const trip = buildTripFromInput({
    destination: input.destination ?? "Untitled",
    startDate: input.startDate ?? "",
    endDate: input.endDate ?? ""
  });

  trips = [trip, ...trips];
  return trip;
}

export function importCalendarEvents(tripId: string, source = "calendar") {
  const trip = trips.find((currentTrip) => currentTrip.id === tripId);

  if (!trip) {
    return {
      source,
      importedCount: 0,
      trip: null
    };
  }

  const importedEvents = importedEventTemplates.map((event, index) => ({
    ...event,
    date: shiftDate(trip.startDate, index),
    id: `${source}-${Date.now()}-${index}`
  }));

  trips = trips.map((trip) =>
    trip.id === tripId
      ? {
          ...trip,
          events: [...trip.events, ...importedEvents]
        }
      : trip
  );

  return {
    source,
    importedCount: importedEvents.length,
    trip: trips.find((trip) => trip.id === tripId) ?? null
  };
}

export function getWeatherForTrip(tripId: string) {
  const trip = trips.find((currentTrip) => currentTrip.id === tripId);

  if (!trip) {
    return null;
  }

  const destinationSlug = slugifyDestination(trip.destination);
  const profile = destinationProfiles[destinationSlug];

  return profile?.weather ?? trip.weather;
}

export function generatePackingList(tripId: string) {
  const trip = trips.find((currentTrip) => currentTrip.id === tripId);

  if (!trip) {
    return null;
  }

  const destinationSlug = slugifyDestination(trip.destination);
  const profile = destinationProfiles[destinationSlug];
  const items = new Set<string>([
    "Passport",
    "Laptop and charger",
    "Phone charger",
    "Noise-canceling headphones",
    "Business outfit",
    ...(profile?.basePacking ?? [])
  ]);

  if (trip.weather.rainChance >= 40) {
    items.add("Umbrella");
  }

  if (trip.weather.lowTempC <= 12) {
    items.add("Warm mid-layer");
  }

  if (trip.weather.highTempC >= 28) {
    items.add("Breathable travel clothes");
  }

  const hasDinner = trip.events.some((event) => event.type === "dinner");
  const hasWorkshop = trip.events.some((event) => event.type === "workshop");
  const hasFlight = trip.events.some((event) => event.type === "flight");

  if (hasDinner) {
    items.add("Smart evening outfit");
  }

  if (hasWorkshop) {
    items.add("Workshop materials");
  }

  if (hasFlight) {
    items.add("Travel document folder");
  }

  return Array.from(items);
}
