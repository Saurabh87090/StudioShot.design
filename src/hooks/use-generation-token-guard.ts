"use client";

import { useCallback, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface GenerationResponse {
  outOfTokens?: boolean;
}

export function useGenerationTokenGuard() {
  const [isOutOfTokensModalOpen, setIsOutOfTokensModalOpen] = useState(false);
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const checkTokenBalance = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(`Could not verify your account: ${authError.message}`);
    }

    if (!user) return true;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("tokens")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not check your token balance: ${error.message}`);
    }

    const tokens = profile?.tokens;
    if (typeof tokens !== "number" || !Number.isFinite(tokens) || tokens < 10) {
      setIsOutOfTokensModalOpen(true);
      return false;
    }

    return true;
  }, [supabase]);

  const handleOutOfTokensResponse = useCallback(
    (response: Response, data: GenerationResponse) => {
      if (data.outOfTokens === true || response.status === 403) {
        setIsOutOfTokensModalOpen(true);
        return true;
      }

      return false;
    },
    [],
  );

  return {
    isOutOfTokensModalOpen,
    setIsOutOfTokensModalOpen,
    checkTokenBalance,
    handleOutOfTokensResponse,
  };
}
