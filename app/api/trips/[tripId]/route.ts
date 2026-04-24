import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserTrip, updateUserTrip } from "@/lib/trip-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tripId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await context.params;
  const trip = await getUserTrip(session.user.id, tripId);

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  return NextResponse.json({ trip });
}

export async function PATCH(
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
    const trip = await updateUserTrip(session.user.id, tripId, body);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update trip." },
      { status: 400 }
    );
  }
}
