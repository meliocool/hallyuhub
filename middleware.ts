// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Only run on pages you care about.
// - First matcher runs on (almost) all pages so we can set sessionCartId.
// - Second matcher protects account/checkout with auth.
export const config = {
  matcher: [
    // set sessionCartId on most pages (skip static/assets)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|css|js|ico|txt)$).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 1) Ensure sessionCartId cookie exists
  if (!req.cookies.get("sessionCartId")) {
    const id = crypto.randomUUID();
    res.cookies.set("sessionCartId", id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  const path = req.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/account") ||
    path.startsWith("/checkout") ||
    path.startsWith("/orders") ||
    path.startsWith("/product");

  if (needsAuth) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    });

    if (!token) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("from", path);
      return NextResponse.redirect(url);
    }
  }

  return res;
}
