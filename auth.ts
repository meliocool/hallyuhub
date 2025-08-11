import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        // Find user in DB with prisma
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        // Check if user exist && password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user, trigger, token }: any) {
      // Set user ID from token
      session.user.id = token.sub; // the user id in the token is sub dawg
      session.user.role = token.role;
      session.user.name = token.name;

      // If update, set user name
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // If user got no name, then use first part of brochacho's email
        if (user.name === "NO_NAME") {
          token.name = user.email?.split("@")[0]; // Seperated by the @ symbol
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: { name: token.name },
          });
        }
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartId,
              },
            });
            if (sessionCart) {
              // Delete current user Cart
              await prisma.cart.deleteMany({
                where: {
                  userId: user.id,
                },
              });

              // Assign new cart to the mf
              await prisma.cart.update({
                where: {
                  id: sessionCart.id,
                },
                data: {
                  userId: user.id,
                },
              });
            }
          }
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorized({ request }: any) {
      // Array of regex patterns of PROTECTED PAAATHS
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order/,
        /\/admin/,
      ];

      const { pathname } = request.nextUrl;
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      // Session Cart Cookie
      if (!request.cookies.get("sessionCartId")) {
        const sessionCartId = crypto.randomUUID();
        // Clone the req headers
        const newRequestHeaders = new Headers(request.headers);
        // Create new res
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
        // Set mf sessionCartId in cookiee
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
