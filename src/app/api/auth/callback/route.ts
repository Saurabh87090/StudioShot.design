import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSiteOrigin } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const siteOrigin = getSiteOrigin(requestUrl.origin);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${siteOrigin}/?error=${encodeURIComponent("Could not authenticate user")}`,
    );
  }

  const cookieStore = await cookies();
  const redirectResponse = NextResponse.redirect(
    `${siteOrigin}/desktop`,
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return redirectResponse;
  }

  return NextResponse.redirect(
    `${siteOrigin}/?error=${encodeURIComponent(error.message)}`,
  );
}
