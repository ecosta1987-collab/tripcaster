import { NextResponse } from "next/server";
import { createTrip, getTrips } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ trips: getTrips() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const trip = createTrip(body);

  return NextResponse.json({ trip }, { status: 201 });
}
