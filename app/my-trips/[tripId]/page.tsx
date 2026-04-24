import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth-buttons";
import { TripDetail } from "@/components/trip-detail";

type TripDetailPageProps = {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function TripDetailPage({ params, searchParams }: TripDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const { tripId } = await params;
  const { tab } = await searchParams;

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/my-trips" className="text-sm font-medium text-ink/70 transition hover:text-ink">
          Back to trips
        </Link>
        <SignOutButton />
      </div>
      <TripDetail
        tripId={tripId}
        userName={session.user.name ?? "Traveler"}
        initialTab={tab}
      />
    </>
  );
}
