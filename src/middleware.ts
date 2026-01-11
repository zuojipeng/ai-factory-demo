import { NextRequest, NextResponse } from "next/server";

import { extractToken, getTokenCookieName, verifyJwt } from "./lib/jwt";

const PUBLIC_PATH_PREFIXES = ["/api/public", "/api/auth", "/"];
const PROTECTED_PAGE_PREFIXES = ["/protected", "/dashboard"];

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const isProtectedPath = (pathname: string): boolean =>
  pathname.startsWith("/api/") || PROTECTED_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const unauthorizedJsonResponse = (): NextResponse =>
  NextResponse.json(
    {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      },
    },
    { status: 401 }
  );

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = extractToken(
    request.headers.get("authorization"),
    request.cookies.get(getTokenCookieName())?.value
  );

  if (!token) {
    return pathname.startsWith("/api/")
      ? unauthorizedJsonResponse()
      : NextResponse.redirect(new URL("/?error=unauthorized", request.url));
  }

  try {
    await verifyJwt(token);
    return NextResponse.next();
  } catch {
    return pathname.startsWith("/api/")
      ? unauthorizedJsonResponse()
      : NextResponse.redirect(new URL("/?error=unauthorized", request.url));
  }
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
