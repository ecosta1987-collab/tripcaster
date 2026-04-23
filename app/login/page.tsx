import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const hasGoogleAuthConfig = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

export default async function LoginPage() {
  if (!hasGoogleAuthConfig) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 shadow-lg shadow-amber-100/60">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Login setup incomplete
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-amber-950">
            Google sign-in is not configured yet.
          </h1>
          <p className="mt-4 text-base leading-7 text-amber-900/80">
            Add <code>AUTH_GOOGLE_ID</code> and <code>AUTH_GOOGLE_SECRET</code> in your Vercel project environment variables, then redeploy.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-amber-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-amber-950"
            >
              Back home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const session = await auth();

  if (session?.user) {
    redirect("/my-trips");
  }

  redirect("/api/auth/signin/google?callbackUrl=%2Fmy-trips");
}
