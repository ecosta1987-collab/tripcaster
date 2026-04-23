import { auth } from "@/auth";
import { SignInButton, SignOutButton } from "@/components/auth-buttons";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between rounded-[2rem] border border-white/70 bg-white/80 px-6 py-5 shadow-glow backdrop-blur">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink/45">TripCaster</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Business trip planning, ready for real users</h1>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/my-trips"
                className="rounded-full border border-ink/10 bg-sand px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand/80"
              >
                My Trips
              </Link>
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
        <div className="absolute inset-0 bg-grid bg-[size:32px_32px] opacity-40" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-sky/20 blur-3xl" />
        <div className="absolute bottom-0 left-24 h-40 w-40 rounded-full bg-coral/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-ink/10 bg-sand px-4 py-1 text-sm font-medium text-ink/80">
              Google login, Auth.js, Supabase Postgres, Vercel-ready
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink md:text-5xl">
              Plan client travel with private trips, personal preferences, and protected data.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
              Sign in to manage your own trips, calendar events, packing lists, timezone planning,
              and travel preferences. Each account only sees its own data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {session ? (
                <Link
                  href="/my-trips"
                  className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90"
                >
                  Open My Trips
                </Link>
              ) : (
                <SignInButton />
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-ink/10 bg-white/90 p-4">
              <p className="text-sm font-medium text-ink">Private workspace</p>
              <p className="mt-1 text-sm text-ink/60">Trips, events, lists, and preferences are stored per user.</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/90 p-4">
              <p className="text-sm font-medium text-ink">Protected APIs</p>
              <p className="mt-1 text-sm text-ink/60">Unauthenticated requests are blocked server-side.</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/90 p-4">
              <p className="text-sm font-medium text-ink">Ready to deploy</p>
              <p className="mt-1 text-sm text-ink/60">Google OAuth, Prisma, Supabase Postgres, and Vercel envs are prepared.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
