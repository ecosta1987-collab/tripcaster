import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rebuildPackingListForTrip } from "@/lib/trip-service";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const packingList = await rebuildPackingListForTrip(session.user.id, body.tripId);

  if (!packingList) {
    return NextResponse.json(
      { error: "Trip not found for packing list generation." },
      { status: 404 }
    );
  }

  return NextResponse.json({ packingList });
}
