import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addEventToUserTrip } from "@/lib/trip-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await context.params;
  try {
    const body = await request.json();
    const trip = await addEventToUserTrip(session.user.id, tripId, body);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found or event is incomplete." }, { status: 404 });
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to add event." }, { status: 400 });
  }
}
