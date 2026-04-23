import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createUserTrip, listUserTrips } from "@/lib/trip-service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await listUserTrips(session.user.id);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const trip = await createUserTrip(session.user.id, body);

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create trip."
      },
      { status: 400 }
    );
  }
}
