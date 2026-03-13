import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  const protectedRoutes = ["/submit", "/favorites"];
  const adminRoutes = ["/admin"];

  if (adminRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
  }

  if (protectedRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
