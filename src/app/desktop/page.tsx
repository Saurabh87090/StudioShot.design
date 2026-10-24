import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { DashboardClient } from "./dashboard-client";

export default async function DesktopPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardClient
      user={{
        id: user?.id,
        name: user?.user_metadata?.full_name || user?.email || "User",
        email: user?.email || "",
        avatar: user?.user_metadata?.avatar_url || "/default-avatar.png",
      }}
    />
  );
}
