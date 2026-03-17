import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) return null;
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, image: true, role: true, password: true },
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      } else if (typeof token.id === "string") {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { id: true, role: true, email: true, name: true, image: true },
        });

        if (!currentUser) {
          delete token.id;
          delete token.role;
          delete token.email;
          delete token.name;
          delete token.picture;
        } else {
          token.id = currentUser.id;
          token.role = currentUser.role;
          token.email = currentUser.email ?? undefined;
          token.name = currentUser.name ?? undefined;
          token.picture = currentUser.image ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
