import { NextResponse } from "next/server";
import { getWeatherForTrip } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = await request.json();
  const weather = getWeatherForTrip(body.tripId);

  if (!weather) {
    return NextResponse.json(
      { error: "Trip not found for weather lookup." },
      { status: 404 }
    );
  }

  return NextResponse.json({ weather });
}
