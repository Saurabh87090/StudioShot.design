import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const GENERATION_TOKEN_COST = 10;

export function outOfTokensResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "You have used all your free generations!",
      outOfTokens: true,
    },
    { status: 403 },
  );
}

async function getTokenBalance(supabase: SupabaseClient, userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("tokens")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read token balance: ${error.message}`);
  }

  if (!profile || profile.tokens == null) {
    return 0;
  }

  if (typeof profile.tokens !== "number" || !Number.isFinite(profile.tokens)) {
    throw new Error("The user's token balance is invalid.");
  }

  return profile.tokens;
}

export async function hasGenerationTokens(
  supabase: SupabaseClient,
  userId: string,
) {
  const tokens = await getTokenBalance(supabase, userId);
  return tokens >= GENERATION_TOKEN_COST;
}

export async function deductGenerationTokens(
  supabase: SupabaseClient,
  userId: string,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const tokens = await getTokenBalance(supabase, userId);
    if (tokens < GENERATION_TOKEN_COST) {
      return false;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ tokens: tokens - GENERATION_TOKEN_COST })
      .eq("id", userId)
      .eq("tokens", tokens)
      .gte("tokens", GENERATION_TOKEN_COST)
      .select("tokens")
      .maybeSingle();

    if (error) {
      throw new Error(`Could not deduct generation tokens: ${error.message}`);
    }

    if (data) {
      return true;
    }
  }

  return false;
}
