import type { NextAuthConfig } from "next-auth";

/**
 * Lightweight auth config that is safe to use in Edge Runtime (middleware).
 * Does NOT import Prisma or any Node.js-only modules.
 */
export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN";

      const pathname = nextUrl.pathname;
      const adminRoutes = ["/admin"];
      const protectedRoutes = ["/submit", "/favorites"];

      if (adminRoutes.some((route) => pathname.startsWith(route))) {
        return isAdmin;
      }
      if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
