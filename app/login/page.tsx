import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/my-trips");
  }

  redirect("/api/auth/signin/google?callbackUrl=%2Fmy-trips");
}
