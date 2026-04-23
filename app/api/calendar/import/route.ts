import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { importMockCalendarEvents } from "@/lib/trip-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = await importMockCalendarEvents(session.user.id, body.tripId, body.source);

  return NextResponse.json(result);
}
