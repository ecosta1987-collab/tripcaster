import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWeatherForUserTrip } from "@/lib/trip-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const weather = await getWeatherForUserTrip(session.user.id, body.tripId);

  if (!weather) {
    return NextResponse.json(
      { error: "Trip not found for weather lookup." },
      { status: 404 }
    );
  }

  return NextResponse.json({ weather });
}
