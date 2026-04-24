import {
  AgendaItem,
  EventType,
  PackingSection,
  PlaceInfo,
  TripDayWeather,
  TripStep,
  UserPreference,
  WeatherSummary
} from "@/lib/types";

type DestinationProfile = {
  timezone: string;
  weather: WeatherSummary;
  placeInfo: PlaceInfo;
  basePacking: string[];
};

const fallbackProfile: DestinationProfile = {
  timezone: "UTC",
  weather: {
    summary: "Forecast placeholder for a newly added destination.",
    highTempC: 22,
    lowTempC: 14,
    rainChance: 20,
    note: "Live forecast not connected yet."
  },
  placeInfo: {
    summary: "A flexible business destination profile ready to be enriched with live data later.",
    imageUrl:
      "https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg?auto=compress&cs=tinysrgb&w=1200",
    highlights: ["Business district access", "Flexible local transport", "Good meeting infrastructure"]
  },
  basePacking: ["Laptop charger", "Business cards", "Comfortable shoes"]
};

const destinationProfiles: Record<string, DestinationProfile> = {
  tokyo: {
    timezone: "Asia/Tokyo",
    weather: {
      summary: "Mild mornings with a chance of light rain later in the week.",
      highTempC: 21,
      lowTempC: 13,
      rainChance: 35,
      note: "Pack layers for commuter temperature swings."
    },
    placeInfo: {
      summary: "Tokyo blends polished business hubs with precise public transport and late-night dining options.",
      imageUrl:
        "https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=1200",
      highlights: ["Reliable rail network", "Dense hotel options", "Strong after-hours dining scene"]
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
    placeInfo: {
      summary: "London offers easy access to financial districts, strong rail links, and meeting venues across central neighborhoods.",
      imageUrl:
        "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1200",
      highlights: ["Fast airport rail links", "Dense central meeting zones", "Walkable mixed-use neighborhoods"]
    },
    basePacking: ["Waterproof shoes", "Layering knit", "Foldable umbrella"]
  },
  "new york": {
    timezone: "America/New_York",
    weather: {
      summary: "Warm afternoons and bright weather, with one evening thunder risk.",
      highTempC: 25,
      lowTempC: 16,
      rainChance: 25,
      note: "A blazer is enough for most outdoor transit."
    },
    placeInfo: {
      summary: "New York is ideal for dense client schedules, quick cross-town transfers, and a strong supply of hotels near business centers.",
      imageUrl:
        "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1200",
      highlights: ["Multiple airport options", "Dense hotel inventory", "Strong taxi and subway coverage"]
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
    placeInfo: {
      summary: "Singapore is efficient for regional business travel, with strong airport logistics and compact commercial districts.",
      imageUrl:
        "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1200",
      highlights: ["Fast airport transfers", "Compact business core", "Reliable taxi and metro options"]
    },
    basePacking: ["Breathable shirts", "Extra undershirts", "Mini umbrella"]
  }
};

export function slugifyDestination(destination: string) {
  return destination.trim().toLowerCase();
}

export function getDestinationProfile(destination: string) {
  return destinationProfiles[slugifyDestination(destination)] ?? fallbackProfile;
}

export function getWeatherSummary(destination: string) {
  return getDestinationProfile(destination).weather;
}

export function getPlaceInfo(destination: string) {
  return getDestinationProfile(destination).placeInfo;
}

export function buildOverviewPlaceInfo(destinations: string[]) {
  const firstDestination = destinations[0] ?? "Business destination";
  const profile = getDestinationProfile(firstDestination);
  const uniqueDestinations = Array.from(new Set(destinations.filter(Boolean)));

  return {
    summary:
      uniqueDestinations.length > 1
        ? `${profile.placeInfo.summary} This trip also includes ${uniqueDestinations.slice(1).join(", ")}.`
        : profile.placeInfo.summary,
    imageUrl: profile.placeInfo.imageUrl,
    highlights:
      uniqueDestinations.length > 1
        ? [...profile.placeInfo.highlights, `${uniqueDestinations.length} destination stops planned`]
        : profile.placeInfo.highlights
  };
}

export function buildPackingSections(args: {
  destination: string;
  eventTypes: EventType[];
  packingStyle: UserPreference["packingStyle"];
  tripDates: string[];
}) {
  const profile = getDestinationProfile(args.destination);
  const clothingItems = ["Business outfit", "Comfortable shoes"];
  const beautyItems = ["Toothbrush kit", "Travel-size toiletries"];
  const electronicsItems = ["Laptop and charger", "Phone charger", "Noise-canceling headphones"];
  const otherItems = ["Passport", ...profile.basePacking];

  if (profile.weather.rainChance >= 40) {
    clothingItems.push("Umbrella");
  }

  if (profile.weather.lowTempC <= 12) {
    clothingItems.push("Warm mid-layer");
  }

  if (profile.weather.highTempC >= 28) {
    clothingItems.push("Breathable travel clothes");
  }

  if (args.eventTypes.includes("dinner")) {
    clothingItems.push("Smart evening outfit");
  }

  if (args.eventTypes.includes("workshop")) {
    otherItems.push("Workshop materials");
  }

  if (args.eventTypes.includes("flight")) {
    otherItems.push("Travel document folder");
  }

  if (args.packingStyle === "extended") {
    clothingItems.push("Backup formal shirt");
    electronicsItems.push("Extra charging cable");
    otherItems.push("Laundry pouch");
  }

  const sections: PackingSection[] = [
    {
      id: "clothes",
      name: "Clothes",
      items: clothingItems.map((label, index) => ({
        id: `clothes-${index}`,
        label,
        day: null,
        notes: null
      }))
    },
    {
      id: "beauty",
      name: "Beauty",
      items: beautyItems.map((label, index) => ({
        id: `beauty-${index}`,
        label,
        day: null,
        notes: null
      }))
    },
    {
      id: "electronics",
      name: "Electronics",
      items: electronicsItems.map((label, index) => ({
        id: `electronics-${index}`,
        label,
        day: null,
        notes: null
      }))
    },
    {
      id: "other",
      name: "Other",
      items: otherItems.map((label, index) => ({
        id: `other-${index}`,
        label,
        day: null,
        notes: null
      }))
    }
  ];

  sections[0].items.push(
    ...args.tripDates.map((date, index) => ({
      id: `day-clothes-${index}`,
      label: "Outfit for the day",
      day: date,
      notes: "Adjust according to the agenda for this date."
    }))
  );

  return sections;
}

export function flattenPackingSections(sections: PackingSection[]) {
  return sections.flatMap((section) => section.items.map((item) => item.label));
}

export function buildDailyForecast(args: {
  tripStartDate: string;
  tripEndDate: string;
  steps: TripStep[];
}) {
  const days: TripDayWeather[] = [];
  let cursor = new Date(`${args.tripStartDate}T00:00:00.000Z`);
  const finalDate = new Date(`${args.tripEndDate}T00:00:00.000Z`);

  while (cursor <= finalDate) {
    const date = cursor.toISOString().slice(0, 10);
    const activeStep = args.steps.find((step) => step.startDate <= date && step.endDate >= date);

    if (!activeStep) {
      days.push({
        date,
        destination: "Transit day",
        timezone: "UTC",
        available: false,
        summary: "Not yet available",
        highTempC: null,
        lowTempC: null,
        rainChance: null,
        note: "No destination has been assigned to this date yet."
      });
    } else {
      const weather = getWeatherSummary(activeStep.destination);
      days.push({
        date,
        destination: activeStep.destination,
        timezone: activeStep.timezone,
        available: true,
        summary: weather.summary,
        highTempC: weather.highTempC,
        lowTempC: weather.lowTempC,
        rainChance: weather.rainChance,
        note: weather.note
      });
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

export function importMockEvents(startDate: Date) {
  const nextDay = new Date(startDate);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  return [
    {
      title: "Airport transfer buffer",
      date: startDate,
      startTime: "08:30",
      endTime: "09:15",
      type: "flight" as const
    },
    {
      title: "Regional leadership dinner",
      date: nextDay,
      startTime: "19:00",
      endTime: "21:00",
      type: "dinner" as const
    }
  ];
}

export function buildAgendaSummaryByDay(date: string, agenda: AgendaItem[]) {
  const entries = agenda.filter((item) => item.date === date);

  if (!entries.length) {
    return "No agenda summary yet.";
  }

  return entries
    .map((item) =>
      item.startTime ? `${item.startTime} ${item.title}` : `${item.title}${item.notes ? `: ${item.notes}` : ""}`
    )
    .join(" • ");
}
