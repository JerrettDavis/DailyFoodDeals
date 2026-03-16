import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { canUseRuntimeAuth } from "@/lib/runtime-config";

const { auth } = NextAuth(authConfig);

export default canUseRuntimeAuth
  ? auth
  : function proxy() {
      return NextResponse.next();
    };

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
