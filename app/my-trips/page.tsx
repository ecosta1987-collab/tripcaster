import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth-buttons";
import { MyTripsOverview } from "@/components/my-trips-overview";
import Link from "next/link";

export default async function MyTripsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-medium text-ink/70 transition hover:text-ink">
          Back home
        </Link>
        <SignOutButton />
      </div>
      <MyTripsOverview
        userName={session.user.name ?? "Traveler"}
        userEmail={session.user.email ?? ""}
      />
    </>
  );
}
