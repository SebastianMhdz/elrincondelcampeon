import { supabase } from "@/integrations/supabase/client";

export type AdminLog = {
  id: string;
  admin_name: string;
  accessed_at: string;
};

export const fetchAdminLogs = async (): Promise<AdminLog[]> => {
  const { data, error } = await supabase
    .from("admin_logs")
    .select("id, admin_name, accessed_at")
    .order("accessed_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as AdminLog[];
};

export const requestAdminUnlock = async (adminName: string, accessCode: string) => {
  const { data, error } = await supabase.functions.invoke("acceso-admin", {
    body: { adminName, accessCode },
  });
  if (error) return { ok: false, error: error.message };
  if (!data?.success) return { ok: false, error: data?.error ?? "Acceso denegado" };
  return { ok: true, name: data.name as string };
};
