export type EventType = "meeting" | "flight" | "dinner" | "workshop";

export type TripEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
};

export type CalendarEvent = TripEvent;

export type WeatherSummary = {
  summary: string;
  highTempC: number;
  lowTempC: number;
  rainChance: number;
  note: string;
};

export type UserPreference = {
  homeTimezone: string;
  favoriteAirport: string | null;
  packingStyle: "light" | "standard" | "extended";
};

export type Trip = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  timezone: string;
  homeTimezone: string;
  events: TripEvent[];
  packingList: string[];
  weather: WeatherSummary;
};

export type TripsResponse = {
  preferences: UserPreference;
  trips: Trip[];
};

export type WeatherResponse = {
  weather: WeatherSummary;
};

export type PackingListResponse = {
  packingList: string[];
};

export type PreferencesResponse = {
  preferences: UserPreference;
};
