import { EventType, UserPreference, WeatherSummary } from "@/lib/types";

type DestinationProfile = {
  timezone: string;
  weather: WeatherSummary;
  basePacking: string[];
};

const fallbackProfile: DestinationProfile = {
  timezone: "UTC",
  weather: {
    summary: "Forecast placeholder for a newly added destination.",
    highTempC: 22,
    lowTempC: 14,
    rainChance: 20,
    note: "Connect a live weather provider later if you need real forecasts."
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
  "new york": {
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

export function slugifyDestination(destination: string) {
  return destination.trim().toLowerCase();
}

export function getDestinationProfile(destination: string) {
  return destinationProfiles[slugifyDestination(destination)] ?? fallbackProfile;
}

export function buildPackingList(args: {
  destination: string;
  eventTypes: EventType[];
  packingStyle: UserPreference["packingStyle"];
}) {
  const profile = getDestinationProfile(args.destination);
  const items = new Set<string>([
    "Passport",
    "Laptop and charger",
    "Phone charger",
    "Noise-canceling headphones",
    "Business outfit",
    ...profile.basePacking
  ]);

  if (profile.weather.rainChance >= 40) {
    items.add("Umbrella");
  }

  if (profile.weather.lowTempC <= 12) {
    items.add("Warm mid-layer");
  }

  if (profile.weather.highTempC >= 28) {
    items.add("Breathable travel clothes");
  }

  if (args.eventTypes.includes("dinner")) {
    items.add("Smart evening outfit");
  }

  if (args.eventTypes.includes("workshop")) {
    items.add("Workshop materials");
  }

  if (args.eventTypes.includes("flight")) {
    items.add("Travel document folder");
  }

  if (args.packingStyle === "light") {
    items.delete("Workshop materials");
  }

  if (args.packingStyle === "extended") {
    items.add("Backup formal shirt");
    items.add("Extra charging cable");
    items.add("Laundry pouch");
  }

  return Array.from(items);
}

export function getWeatherSummary(destination: string) {
  return getDestinationProfile(destination).weather;
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
