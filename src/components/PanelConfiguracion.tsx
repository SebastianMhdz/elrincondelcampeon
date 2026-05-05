import { useEffect, useMemo, useState } from "react";
import { Settings2, Shield, Palette, Languages, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAdminLogs, requestAdminUnlock, type AdminLog } from "@/lib/administrador";
import AdminReportsLog from "@/components/RegistroReportesAdmin";
import type { BrandingSettings } from "@/lib/configuracion-sitio";
import type { Json } from "@/integrations/supabase/types";
import type { Locale, Translation } from "@/lib/i18n";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import CanchaAdminPanel from "@/components/PanelAdminCanchas";
import PanelBasesDatosAdmin from "@/components/PanelBasesDatosAdmin";
import PanelBaneosAdmin from "@/components/PanelBaneosAdmin";

interface SettingsPanelProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
  text: Translation;
  branding: BrandingSettings;
  onBrandingChange: (value: BrandingSettings) => void;
}

const SettingsPanel = ({ locale, onLocaleChange, darkMode, onDarkModeChange, text, branding, onBrandingChange }: SettingsPanelProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [adminName, setAdminName] = useState(() => localStorage.getItem("admin-name") ?? "");
  const [accessCode, setAccessCode] = useState("");
  const [admin, setAdmin] = useState(() => localStorage.getItem("admin-active") === "1" && !!sessionStorage.getItem("admin-access-code"));
  const [unlocking, setUnlocking] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [form, setForm] = useState<BrandingSettings>(branding);
  const [logs, setLogs] = useState<AdminLog[]>([]);

  useEffect(() => { setForm(branding); }, [branding]);

  useEffect(() => {
    if (open) fetchAdminLogs().then(setLogs);
  }, [open, admin]);

  useEffect(() => {
    if (open) {
      document.body.dataset.settingsOpen = "1";
    } else {
      delete document.body.dataset.settingsOpen;
    }
    return () => { delete document.body.dataset.settingsOpen; };
  }, [open]);

  const localeOptions = useMemo(() => [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "pt", label: "Português" },
    { value: "de", label: "Deutsch" },
  ], []);

  const unlockAdmin = async () => {
    if (!adminName.trim() || !accessCode) {
      toast({ title: text.errorTitle, description: text.completeAllFields, variant: "destructive" });
      return;
    }
    setUnlocking(true);
    const result = await requestAdminUnlock(adminName.trim(), accessCode);
    setUnlocking(false);
    if (!result.ok) {
      toast({ title: text.errorTitle, description: result.error, variant: "destructive" });
      return;
    }
    setAdmin(true);
    localStorage.setItem("admin-active", "1");
    localStorage.setItem("admin-name", adminName.trim());
    sessionStorage.setItem("admin-access-code", accessCode);
    setAccessCode("");
    toast({ title: text.unlockAdmin, description: `${text.loggedInAs}: ${result.name}` });
    fetchAdminLogs().then(setLogs);
  };

  const lockAdmin = () => {
    setAdmin(false);
    localStorage.removeItem("admin-active");
    sessionStorage.removeItem("admin-access-code");
  };

  const saveBranding = async () => {
    setSavingBranding(true);
    const { error } = await supabase.from("site_settings").update({ setting_value: form as unknown as Json }).eq("setting_key", "branding");
    setSavingBranding(false);
    if (error) {
      toast({ title: text.errorTitle, description: error.message, variant: "destructive" });
      return;
    }
    onBrandingChange(form);
    toast({ title: text.saveChanges, description: "✓" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl px-3 py-6 text-left text-white hover:bg-white/10 hover:text-white">
          <Settings2 className="h-4 w-4" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{text.settings}</p>
            <p className="truncate text-xs text-white/60">{text.settingsHint}</p>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={`${admin ? "w-[min(96vw,1180px)] max-w-none" : "max-w-3xl"} max-h-[94vh] rounded-2xl border-border bg-background overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>{text.settings}</DialogTitle>
          <DialogDescription>{text.settingsHint}</DialogDescription>
        </DialogHeader>

        <div className={`${admin ? "grid gap-6 lg:grid-cols-[0.72fr_1.55fr]" : "grid gap-6 md:grid-cols-[0.9fr_1.1fr]"}`}>
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Languages className="h-4 w-4 text-primary" /> {text.language}</div>
              <Select value={locale} onValueChange={(value) => onLocaleChange(value as Locale)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {localeOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Palette className="h-4 w-4 text-primary" /> {text.theme}</div>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <p className="text-sm font-medium text-foreground">{darkMode ? text.dark : text.light} ({text.current})</p>
                <Switch checked={darkMode} onCheckedChange={onDarkModeChange} />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Shield className="h-4 w-4 text-primary" /> {text.adminAccess}</div>
              <p className="text-sm text-muted-foreground">{text.adminDescription}</p>
              <div className="space-y-2">
                <Label>{text.fullName}</Label>
                <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Carlos Vargas" />
              </div>
              <div className="space-y-2">
                <Label>{text.accessCode}</Label>
                <Input value={accessCode} onChange={(e) => setAccessCode(e.target.value)} type="password" placeholder="••••••••" />
              </div>
              <div className="flex flex-wrap gap-2">
                {!admin ? (
                  <Button onClick={unlockAdmin} disabled={unlocking} className="bg-primary text-primary-foreground">{unlocking ? "..." : text.unlockAdmin}</Button>
                ) : (
                  <Button variant="outline" onClick={lockAdmin}>{text.signOutBtn}</Button>
                )}
              </div>
              {admin && <p className="text-xs text-accent">✓ {text.loggedInAs}: <strong>{localStorage.getItem("admin-name")}</strong></p>}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <p className="text-base font-semibold text-foreground">{text.adminPanel}</p>
              <p className="text-sm text-muted-foreground">{text.adminPanelDescription}</p>
            </div>

            {admin ? (
              <>
                <div className="space-y-2"><Label>{text.appName}</Label><Input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} /></div>
                <div className="space-y-2"><Label>{text.tagline}</Label><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>{text.footerPhone}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>{text.footerAddress}</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>{text.footerAuthors}</Label><Input value={form.authors.join(", ")} onChange={(e) => setForm({ ...form, authors: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} /></div>
                <Button onClick={saveBranding} disabled={savingBranding} className="bg-primary text-primary-foreground">{savingBranding ? "..." : text.saveChanges}</Button>
                <CanchaAdminPanel />
                <PanelBasesDatosAdmin />
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">{text.adminOnlyMessage}</div>
            )}

            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><History className="h-4 w-4 text-primary" /> {text.adminLogs}</div>
              <p className="text-xs text-muted-foreground">{text.adminLogsDescription}</p>
              {logs.length === 0 ? (
                <p className="py-3 text-xs italic text-muted-foreground">{text.noLogsYet}</p>
              ) : (
                <ul className="max-h-44 space-y-1.5 overflow-y-auto text-xs">
                  {logs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2">
                      <span className="font-semibold text-foreground">{log.admin_name}</span>
                      <span className="text-muted-foreground">{new Date(log.accessed_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {admin && <AdminReportsLog text={text} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
