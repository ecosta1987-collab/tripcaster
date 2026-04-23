export type EventType = "meeting" | "flight" | "dinner" | "workshop";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: EventType;
};

export type WeatherSummary = {
  summary: string;
  highTempC: number;
  lowTempC: number;
  rainChance: number;
  note: string;
};

export type Trip = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  timezone: string;
  homeTimezone: string;
  events: CalendarEvent[];
  weather: WeatherSummary;
};

export type TripsResponse = {
  trips: Trip[];
};

export type WeatherResponse = {
  weather: WeatherSummary;
};

export type PackingListResponse = {
  packingList: string[];
};
