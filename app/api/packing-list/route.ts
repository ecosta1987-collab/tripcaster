import { NextResponse } from "next/server";
import { generatePackingList } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = await request.json();
  const packingList = generatePackingList(body.tripId);

  if (!packingList) {
    return NextResponse.json(
      { error: "Trip not found for packing list generation." },
      { status: 404 }
    );
  }

  return NextResponse.json({ packingList });
}
