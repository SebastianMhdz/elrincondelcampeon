import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  user_id: string;
  display_name: string | null;
  custom_name: string | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
  preferred_locale: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("user_id, display_name, custom_name, country, bio, avatar_url, preferred_locale")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as UserProfile) ?? null;
}

export async function upsertProfile(userId: string, patch: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
    .select("user_id, display_name, custom_name, country, bio, avatar_url, preferred_locale")
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export async function getProfilesMap(userIds: string[]): Promise<Map<string, Pick<UserProfile, "custom_name" | "display_name" | "avatar_url">>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, custom_name, display_name, avatar_url")
    .in("user_id", userIds);
  return new Map((data ?? []).map(p => [p.user_id, p]));
}

export function displayNameOf(p?: { custom_name?: string | null; display_name?: string | null } | null, fallback = "Anónimo"): string {
  return p?.custom_name?.trim() || p?.display_name?.trim() || fallback;
}
