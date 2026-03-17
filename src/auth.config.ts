import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth-env";

/**
 * Lightweight auth config that is safe to use in Edge Runtime (middleware).
 * Does NOT import Prisma or any Node.js-only modules.
 */
export const authConfig = {
  trustHost:
    process.env.AUTH_TRUST_HOST === "true" ||
    process.env.VERCEL === "1" ||
    process.env.CF_PAGES === "1",
  secret: getAuthSecret(),
  pages: {
    signIn: "/auth/signin",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const pathname = nextUrl.pathname;
      const adminRoutes = ["/admin"];
      const protectedRoutes = ["/submit", "/favorites"];

      if (adminRoutes.some((route) => pathname.startsWith(route))) {
        return isLoggedIn;
      }
      if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
