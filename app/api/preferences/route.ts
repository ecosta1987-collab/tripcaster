import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserPreferences, updateUserPreferences } from "@/lib/trip-service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await getUserPreferences(session.user.id);
  return NextResponse.json({ preferences });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const preferences = await updateUserPreferences(session.user.id, body);

  return NextResponse.json({ preferences });
}
