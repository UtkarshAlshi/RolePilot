import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma/client";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Demo credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!env.AUTH_ALLOW_DEMO_LOGIN) {
          return null;
        }

        if (
          credentials?.email === env.AUTH_DEMO_EMAIL &&
          credentials?.password === env.AUTH_DEMO_PASSWORD
        ) {
          // Ensure a real DB user exists so downstream ownership-scoped writes succeed.
          const user = await prisma.user.upsert({
            where: { email: env.AUTH_DEMO_EMAIL },
            update: { name: "Demo User" },
            create: {
              id: "demo-user-1",
              email: env.AUTH_DEMO_EMAIL,
              name: "Demo User"
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? "Demo User"
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  trustHost: true
};
