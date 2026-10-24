import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Agar user logged in NAHI hai aur `/desktop` access karne ki koshish kare, toh Home (`/`) par bhej do
  if (!user && pathname.startsWith("/desktop")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Agar user logged in HAI aur accidental `/login` route par jaye, toh direct `/desktop` par bhej do
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/desktop", request.url));
  }

  return response;
}

export const config = {
  // Matcher ko update karke protected routes include karein
  matcher: ["/desktop/:path*", "/login"],
};
