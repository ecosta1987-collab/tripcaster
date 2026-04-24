export type EventType = "meeting" | "flight" | "dinner" | "workshop" | "note";
export type StayType = "hotel" | "flight" | "other";
export type TimeReference = "local" | "home";

export type WeatherSummary = {
  summary: string;
  highTempC: number;
  lowTempC: number;
  rainChance: number;
  note: string;
};

export type PlaceInfo = {
  summary: string;
  imageUrl: string;
  highlights: string[];
};

export type TripStep = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  timezone: string;
  stayType: StayType;
  stayName: string | null;
  stayProvider: string | null;
  stayProviderUrl: string | null;
  stayNotes: string | null;
};

export type TripDayWeather = {
  date: string;
  destination: string;
  timezone: string;
  available: boolean;
  summary: string;
  highTempC: number | null;
  lowTempC: number | null;
  rainChance: number | null;
  note: string;
};

export type CarRental = {
  id: string;
  startDate: string;
  endDate: string;
  company: string;
  pickupAddress: string;
  sameReturnAddress: boolean;
  returnAddress: string;
  carType: string;
};

export type FlightSegment = {
  id: string;
  flightNumber: string;
  seat: string;
  carrier: string;
  departureAirport: string;
  arrivalAirport: string;
  departureLocal: string;
  arrivalLocal: string;
  arrivalDestinationTime: string;
};

export type AgendaItem = {
  id: string;
  date: string;
  title: string;
  notes: string;
  type: EventType;
  startTime: string | null;
  endTime: string | null;
  timeReference: TimeReference;
};

export type TripEvent = AgendaItem;
export type CalendarEvent = AgendaItem;

export type PackingListItem = {
  id: string;
  label: string;
  day: string | null;
  notes: string | null;
};

export type PackingSection = {
  id: string;
  name: string;
  items: PackingListItem[];
};

export type UserPreference = {
  homeTimezone: string;
  favoriteAirport: string | null;
  packingStyle: "light" | "standard" | "extended";
};

export type TripTravel = {
  cars: CarRental[];
  flights: FlightSegment[];
};

export type Trip = {
  id: string;
  title: string;
  description: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  timezone: string;
  homeTimezone: string;
  placeInfo: PlaceInfo;
  steps: TripStep[];
  weatherOverview: WeatherSummary;
  weatherByDay: TripDayWeather[];
  travel: TripTravel;
  agenda: AgendaItem[];
  packingSections: PackingSection[];
  events: AgendaItem[];
  packingList: string[];
  weather: WeatherSummary;
};

export type TripsResponse = {
  preferences: UserPreference;
  trips: Trip[];
};

export type TripResponse = {
  trip: Trip;
};

export type WeatherResponse = {
  weather: WeatherSummary;
  weatherByDay?: TripDayWeather[];
};

export type PackingListResponse = {
  packingList: string[];
  packingSections?: PackingSection[];
};

export type PreferencesResponse = {
  preferences: UserPreference;
};
