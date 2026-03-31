import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Check for auth cookie existence — don't call the Supabase API from middleware.
  // The actual token validation happens in page server components via getUser().
  // This avoids latency and connectivity issues between Vercel edge and the self-hosted Supabase.
  const hasAuthCookie = request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  );

  // Auth page paths
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/invite") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/api/auth");

  // Redirect unauthenticated users to login (except auth pages)
  if (!hasAuthCookie && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login/signup (but allow onboarding)
  const isLoginOrSignup = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  if (hasAuthCookie && isLoginOrSignup) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
