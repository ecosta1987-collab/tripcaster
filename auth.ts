import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

function hasUserId(user: { id?: string | null }): user is { id: string } {
  return typeof user.id === "string" && user.id.length > 0;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "database"
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? ""
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    session({ session, user }) {
      if (session.user && hasUserId(user)) {
        session.user.id = user.id;
      }

      return session;
    }
  },
  events: {
    async createUser({ user }) {
      if (!hasUserId(user)) {
        return;
      }

      await prisma.preference.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id
        }
      });
    }
  }
});
