import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Translation } from "@/lib/i18n";

interface Report {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  category: string | null;
  created_at: string;
}

const AdminReportsLog = ({ text }: { text: Translation }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("support_reports").select("*").order("created_at", { ascending: false }).limit(50);
    setReports((data as Report[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("support_reports").update({ status }).eq("id", id);
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
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{r.subject}</p>
                  <p className="text-muted-foreground">{r.name} · {r.email}</p>
                </div>
                <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded border border-border bg-background px-1 py-0.5 text-[10px] text-foreground">
                  <option value="open">{text.statusOpen}</option>
                  <option value="in_progress">{text.statusInProgress}</option>
                  <option value="resolved">{text.statusResolved}</option>
                </select>
              </div>
              <p className="text-muted-foreground line-clamp-3">{r.message}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReportsLog;