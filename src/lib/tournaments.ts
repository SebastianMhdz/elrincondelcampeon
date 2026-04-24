import { supabase } from "@/integrations/supabase/client";

export interface Tournament {
  id: string;
  cancha_id: string;
  organizer_id: string;
  name: string;
  description: string | null;
  format: string;
  start_date: string;
  end_date: string;
  prize: string | null;
  max_teams: number;
  signups_open: boolean;
  status: string; // scheduled | ongoing | finished | cancelled
  banner_url: string | null;
  contact_phone: string | null;
  entry_fee: string | null;
  created_at: string;
  updated_at: string;
}

export interface TournamentSignup {
  id: string;
  tournament_id: string;
  user_id: string;
  team_name: string;
  contact_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface TournamentAnnouncement {
  id: string;
  tournament_id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
}

export async function listTournaments(opts: { canchaId?: string; upcoming?: boolean; limit?: number } = {}): Promise<Tournament[]> {
  let q = supabase.from("tournaments").select("*").order("start_date", { ascending: true });
  if (opts.canchaId) q = q.eq("cancha_id", opts.canchaId);
  if (opts.upcoming) q = q.gte("end_date", new Date().toISOString().slice(0, 10));
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as Tournament[]) ?? [];
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const { data } = await supabase.from("tournaments").select("*").eq("id", id).maybeSingle();
  return (data as Tournament) ?? null;
}

export async function createTournament(payload: Omit<Tournament, "id" | "created_at" | "updated_at">): Promise<Tournament> {
  const { data, error } = await supabase.from("tournaments").insert(payload).select().single();
  if (error) throw error;
  return data as Tournament;
}

export async function updateTournament(id: string, patch: Partial<Tournament>): Promise<void> {
  const { error } = await supabase.from("tournaments").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTournament(id: string): Promise<void> {
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
}

export async function listSignups(tournamentId: string): Promise<TournamentSignup[]> {
  const { data } = await supabase.from("tournament_signups").select("*").eq("tournament_id", tournamentId).order("created_at");
  return (data as TournamentSignup[]) ?? [];
}

export async function createSignup(payload: Omit<TournamentSignup, "id" | "created_at" | "status"> & { status?: string }): Promise<void> {
  const { error } = await supabase.from("tournament_signups").insert(payload);
  if (error) throw error;
}

export async function deleteSignup(id: string): Promise<void> {
  const { error } = await supabase.from("tournament_signups").delete().eq("id", id);
  if (error) throw error;
}

export async function listAnnouncements(tournamentId: string): Promise<TournamentAnnouncement[]> {
  const { data } = await supabase.from("tournament_announcements").select("*").eq("tournament_id", tournamentId).order("created_at", { ascending: false });
  return (data as TournamentAnnouncement[]) ?? [];
}

export async function createAnnouncement(payload: Omit<TournamentAnnouncement, "id" | "created_at">): Promise<void> {
  const { error } = await supabase.from("tournament_announcements").insert(payload);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from("tournament_announcements").delete().eq("id", id);
  if (error) throw error;
}
