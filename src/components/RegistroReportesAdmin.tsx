import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Translation } from "@/lib/i18n";
import { getProfilesMap, displayNameOf } from "@/lib/perfil";
import { ejecutarOperacionAdmin } from "@/lib/administrador";
import { useToast } from "@/hooks/use-toast";
import UserAvatar from "./AvatarUsuario";

interface Report {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  category: string | null;
  created_at: string;
  _profileName?: string;
  _profileAvatar?: string | null;
}

const AdminReportsLog = ({ text }: { text: Translation }) => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("support_reports").select("*").order("created_at", { ascending: false }).limit(50);
    const list = (data as Report[]) ?? [];
    const userIds = Array.from(new Set(list.map(r => r.user_id).filter(Boolean) as string[]));
    const map = await getProfilesMap(userIds);
    setReports(list.map(r => {
      const p = r.user_id ? map.get(r.user_id) : null;
      return { ...r, _profileName: p ? displayNameOf(p, r.name) : r.name, _profileAvatar: p?.avatar_url ?? null };
    }));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const current = reports.find((report) => report.id === id);
    const result = await ejecutarOperacionAdmin("reply_report", { id, admin_notes: current?.admin_notes ?? "", status });
    if (!result.ok) {
      toast({ title: "No se pudo cambiar el estado", description: result.error, variant: "destructive" });
      return;
    }
    load();
  };

  const updateReply = async (id: string, admin_notes: string) => {
    setSavingId(id);
    const result = await ejecutarOperacionAdmin("reply_report", { id, admin_notes, status: admin_notes.trim() ? "resolved" : "in_progress" });
    setSavingId(null);
    if (!result.ok) {
      toast({ title: "No se pudo responder", description: result.error, variant: "destructive" });
      return;
    }
    toast({ title: "Respuesta guardada", description: "El usuario verá la respuesta en soporte." });
    load();
  };

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Inbox className="h-4 w-4 text-primary" /> {text.supportReportsLog}</div>
      <p className="text-xs text-muted-foreground">{text.supportReportsHint}</p>
      {loading ? <p className="text-xs text-muted-foreground">…</p> : reports.length === 0 ? (
        <p className="py-3 text-xs italic text-muted-foreground">{text.noReportsYet}</p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {reports.map(r => (
            <li key={r.id} className="rounded-md border border-border bg-card p-3 text-xs">
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <UserAvatar avatarId={r._profileAvatar} name={r._profileName} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{r.subject}</p>
                    <p className="truncate text-muted-foreground">{r._profileName} · {r.email}</p>
                  </div>
                </div>
                <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground">
                  <option value="open">{text.statusOpen}</option>
                  <option value="in_progress">{text.statusInProgress}</option>
                  <option value="resolved">{text.statusResolved}</option>
                </select>
              </div>
              <p className="text-muted-foreground line-clamp-3">{r.message}</p>
              <div className="mt-2 space-y-2 rounded-md border border-border bg-muted/30 p-2">
                <label className="text-[10px] font-semibold text-muted-foreground">{text.replyToUser}</label>
                <textarea defaultValue={r.admin_notes ?? ""} onBlur={(e) => updateReply(r.id, e.target.value)} className="min-h-[64px] w-full rounded border border-border bg-background p-2 text-xs text-foreground outline-none focus:border-primary" placeholder={savingId === r.id ? "Guardando…" : text.teamReply} />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReportsLog;