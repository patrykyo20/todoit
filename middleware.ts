import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  if (!session && pathname.startsWith("/loggedin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/loggedin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
