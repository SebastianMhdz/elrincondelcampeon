import { useEffect, useState } from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ejecutarOperacionAdmin } from "@/lib/administrador";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subscribeToCanchasChanges } from "@/lib/canchas-bd";

interface CourtRow {
  id: string;
  name: string;
  addr: string;
  phone: string | null;
  hours: string | null;
  precio: string | null;
  precio_min: number | null;
  tipo: string | null;
  image_url: string | null;
  servicios: unknown;
  benefits?: unknown;
  social_links?: unknown;
  gallery_urls?: unknown;
  peak_hours?: unknown;
  low_hours?: unknown;
  promotions?: unknown;
  entry_policies?: unknown;
  hourly_pricing?: unknown;
}

const linesHourly = (value: unknown) => {
  if (!Array.isArray(value)) return "";
  return value
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
    .map((x) => `${x.hour ?? ""}|${x.price ?? ""}`)
    .join("\n");
};
const parseHourlyLines = (value: string) => value.split("\n").map((line) => {
  const [hour, ...rest] = line.split("|");
  const price = rest.join("|");
  return { hour: (hour ?? "").trim(), price: (price ?? "").trim() };
}).filter((x) => x.hour && x.price);
const hourlyValue = (value: unknown) => typeof value === "string" ? parseHourlyLines(value) : Array.isArray(value) ? value.filter((x): x is { hour: string; price: string } => !!x && typeof x === "object" && typeof (x as any).hour === "string" && typeof (x as any).price === "string") : [];

const lines = (value: unknown) => Array.isArray(value) ? value.filter((x) => typeof x === "string").join("\n") : "";
const parseLines = (value: string) => value.split("\n").map((x) => x.trim()).filter(Boolean);
const listValue = (value: unknown) => typeof value === "string" ? parseLines(value) : Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
const social = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, string> : {};

const CanchaAdminPanel = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<CourtRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<CourtRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("canchas").select("id,name,addr,phone,hours,precio,precio_min,tipo,image_url,servicios,benefits,social_links,gallery_urls").order("legacy_id", { ascending: true });
    setLoading(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    const rows = (data ?? []) as unknown as CourtRow[];
    setItems(rows);
    if (rows.length && !selectedId) { setSelectedId(rows[0].id); setForm(rows[0]); }
  };

  useEffect(() => {
    load();
    return subscribeToCanchasChanges(load);
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    setForm(items.find((item) => item.id === id) ?? null);
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const socials = social(form.social_links);
    const result = await ejecutarOperacionAdmin("update_cancha", { cancha: {
      ...form,
      servicios: listValue(form.servicios),
      benefits: listValue(form.benefits),
      gallery_urls: listValue(form.gallery_urls),
      social_links: { instagram: socials.instagram || "", facebook: socials.facebook || "", website: socials.website || "" },
    } });
    setSaving(false);
    if (!result.ok) { toast({ title: "No se pudo guardar", description: result.error, variant: "destructive" }); return; }
    toast({ title: "Cancha actualizada", description: "Los cambios ya están guardados." });
    load();
  };

  if (loading) return <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Cargando canchas…</div>;
  if (!form) return <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No hay canchas para configurar.</div>;

  const socials = social(form.social_links);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Pencil className="h-4 w-4 text-primary" /> Configurar canchas</div>
      <Select value={selectedId} onValueChange={select}>
        <SelectTrigger><SelectValue placeholder="Selecciona una cancha" /></SelectTrigger>
        <SelectContent>{items.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
      </Select>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Nombre</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Tipo</Label><Input value={form.tipo ?? ""} onChange={(e) => setForm({ ...form, tipo: e.target.value })} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Dirección</Label><Input value={form.addr} onChange={(e) => setForm({ ...form, addr: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Teléfono</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Horario</Label><Input value={form.hours ?? ""} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Precio visible</Label><Input value={form.precio ?? ""} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Precio mínimo</Label><Input type="number" value={form.precio_min ?? 0} onChange={(e) => setForm({ ...form, precio_min: Number(e.target.value) })} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Foto principal (URL)</Label><Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Servicios (uno por línea)</Label><Textarea rows={4} value={typeof form.servicios === "string" ? form.servicios : lines(form.servicios)} onChange={(e) => setForm({ ...form, servicios: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Beneficios (uno por línea)</Label><Textarea rows={4} value={typeof form.benefits === "string" ? form.benefits : lines(form.benefits)} onChange={(e) => setForm({ ...form, benefits: e.target.value })} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5"><Label>Instagram</Label><Input value={socials.instagram ?? ""} onChange={(e) => setForm({ ...form, social_links: { ...socials, instagram: e.target.value } })} /></div>
        <div className="space-y-1.5"><Label>Facebook</Label><Input value={socials.facebook ?? ""} onChange={(e) => setForm({ ...form, social_links: { ...socials, facebook: e.target.value } })} /></div>
        <div className="space-y-1.5"><Label>Web</Label><Input value={socials.website ?? ""} onChange={(e) => setForm({ ...form, social_links: { ...socials, website: e.target.value } })} /></div>
      </div>
      <div className="space-y-1.5"><Label>Galería de fotos (URLs, una por línea)</Label><Textarea rows={3} value={typeof form.gallery_urls === "string" ? form.gallery_urls : lines(form.gallery_urls)} onChange={(e) => setForm({ ...form, gallery_urls: e.target.value })} /></div>
      <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? "Guardando…" : "Guardar cancha"}</Button>
    </div>
  );
};

export default CanchaAdminPanel;
