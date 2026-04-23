import Link from "next/link";
import { signOut } from "@/auth";

export function SignInButton() {
  return (
    <Link
      href="/login"
      className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-ink/90"
    >
      Sign in with Google
    </Link>
  );
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink/5"
      >
        Sign out
      </button>
    </form>
  );
}
