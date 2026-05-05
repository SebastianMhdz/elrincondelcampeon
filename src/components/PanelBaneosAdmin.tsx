import { useEffect, useState } from "react";
import { Ban, Shield, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BanRow {
  id: string;
  user_id: string;
  reason: string;
  ban_type: string;
  expires_at: string | null;
  created_at: string;
  profile_name?: string;
  profile_email?: string;
}

interface InfractionRow {
  id: string;
  user_id: string;
  infraction_type: string;
  description: string;
  detected_in: string;
  created_at: string;
  profile_name?: string;
}

const PanelBaneosAdmin = () => {
  const { toast } = useToast();
  const [bans, setBans] = useState<BanRow[]>([]);
  const [infractions, setInfractions] = useState<InfractionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bans" | "infractions">("bans");

  // New ban form
  const [banEmail, setBanEmail] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState("temporary");
  const [banDays, setBanDays] = useState("7");
  const [banning, setBanning] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: bansData }, { data: infData }] = await Promise.all([
      supabase.from("user_bans").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("user_infractions").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    // Enrich with profile names
    const allUserIds = new Set([
      ...(bansData ?? []).map((b: any) => b.user_id),
      ...(infData ?? []).map((i: any) => i.user_id),
    ]);

    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, custom_name").in("user_id", [...allUserIds]);
    const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p.display_name || p.custom_name || "Sin nombre"]));

    setBans((bansData ?? []).map((b: any) => ({ ...b, profile_name: profileMap.get(b.user_id) ?? b.user_id.slice(0, 8) })));
    setInfractions((infData ?? []).map((i: any) => ({ ...i, profile_name: profileMap.get(i.user_id) ?? i.user_id.slice(0, 8) })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleBan = async () => {
    if (!banEmail.trim() || !banReason.trim()) {
      toast({ title: "Faltan datos", variant: "destructive" });
      return;
    }
    setBanning(true);
    try {
      // Look up user by email in profiles or auth
      const { data: profile } = await supabase.from("profiles").select("user_id").ilike("display_name", banEmail.trim()).limit(1);
      let userId = profile?.[0]?.user_id;

      if (!userId) {
        // Try searching by the user_id directly if it looks like a UUID
        if (/^[0-9a-f-]{36}$/i.test(banEmail.trim())) {
          userId = banEmail.trim();
        } else {
          toast({ title: "Usuario no encontrado", description: "Usa el ID del usuario (UUID) o su nombre de perfil exacto", variant: "destructive" });
          setBanning(false);
          return;
        }
      }

      const expiresAt = banType === "permanent" ? null : new Date(Date.now() + Number(banDays) * 86400000).toISOString();

      const { error } = await supabase.from("user_bans").insert({
        user_id: userId,
        reason: banReason.trim(),
        ban_type: banType,
        expires_at: expiresAt,
      });

      if (error) throw error;

      toast({ title: "Usuario baneado" });
      setBanEmail("");
      setBanReason("");
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setBanning(false);
    }
  };

  const removeBan = async (id: string) => {
    const { error } = await supabase.from("user_bans").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Ban removido" }); load(); }
  };

  const removeInfraction = async (id: string) => {
    const { error } = await supabase.from("user_infractions").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Infracción eliminada" }); load(); }
  };

  if (loading) return <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <div className="flex items-center gap-2">
        <Ban className="h-5 w-5 text-red-500" />
        <h3 className="text-base font-bold text-foreground">Gestión de Baneos e Infracciones</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        <button onClick={() => setTab("bans")} className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${tab === "bans" ? "bg-card text-red-500 shadow-sm" : "text-muted-foreground"}`}>
          🚫 Baneos ({bans.length})
        </button>
        <button onClick={() => setTab("infractions")} className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${tab === "infractions" ? "bg-card text-amber-500 shadow-sm" : "text-muted-foreground"}`}>
          ⚠️ Infracciones ({infractions.length})
        </button>
      </div>

      {tab === "bans" && (
        <>
          {/* New Ban Form */}
          <div className="space-y-2 rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-semibold text-foreground">Banear usuario</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs">ID o nombre de usuario</Label>
                <Input value={banEmail} onChange={(e) => setBanEmail(e.target.value)} placeholder="UUID o nombre exacto" />
              </div>
              <div>
                <Label className="text-xs">Tipo de ban</Label>
                <Select value={banType} onValueChange={setBanType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary">Temporal</SelectItem>
                    <SelectItem value="permanent">Permanente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {banType === "temporary" && (
              <div>
                <Label className="text-xs">Días de ban</Label>
                <Input type="number" min={1} max={365} value={banDays} onChange={(e) => setBanDays(e.target.value)} />
              </div>
            )}
            <div>
              <Label className="text-xs">Razón</Label>
              <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Motivo del ban..." rows={2} />
            </div>
            <Button onClick={handleBan} disabled={banning} variant="destructive" size="sm">
              {banning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar ban"}
            </Button>
          </div>

          {/* Bans list */}
          {bans.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">No hay usuarios baneados actualmente.</p>
          ) : (
            <ul className="max-h-64 space-y-1.5 overflow-y-auto">
              {bans.map((b) => {
                const expired = b.expires_at && new Date(b.expires_at) < new Date();
                return (
                  <li key={b.id} className={`flex items-start justify-between gap-2 rounded-lg border p-2.5 text-xs ${expired ? "border-border bg-muted/30 opacity-60" : "border-red-500/30 bg-red-500/5"}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{b.profile_name}</p>
                      <p className="text-muted-foreground">{b.reason}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {b.ban_type === "permanent" ? "🔒 Permanente" : `⏱ Temporal hasta ${b.expires_at ? new Date(b.expires_at).toLocaleDateString() : "—"}`}
                        {expired && " · Expirado"}
                      </p>
                    </div>
                    <button onClick={() => removeBan(b.id)} className="shrink-0 text-red-500 hover:opacity-70">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {tab === "infractions" && (
        <>
          {infractions.length === 0 ? (
            <p className="text-xs italic text-muted-foreground">No hay infracciones registradas.</p>
          ) : (
            <ul className="max-h-64 space-y-1.5 overflow-y-auto">
              {infractions.map((inf) => (
                <li key={inf.id} className="flex items-start justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <p className="font-semibold text-foreground">{inf.profile_name}</p>
                    </div>
                    <p className="text-muted-foreground">{inf.description}</p>
                    <p className="text-[10px] text-muted-foreground">Tipo: {inf.infraction_type} · En: {inf.detected_in} · {new Date(inf.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => removeInfraction(inf.id)} className="shrink-0 text-amber-500 hover:opacity-70">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default PanelBaneosAdmin;
