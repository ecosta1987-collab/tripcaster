import { NextResponse } from "next/server";
import { importCalendarEvents } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = await request.json();
  const result = importCalendarEvents(body.tripId, body.source);

  return NextResponse.json(result);
}
