import { useState, useEffect, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createTournament } from "@/lib/torneos";
import { supabase } from "@/integrations/supabase/client";
import type { Cancha } from "@/data/canchas";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { parseHours, isDayOpen } from "@/lib/horarios-cancha";

interface Props {
  user: User;
  canchas: Cancha[];
  onClose: () => void;
  onCreated: () => void;
}

const TournamentForm = ({ user, canchas, onClose, onCreated }: Props) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [legacyId, setLegacyId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("Fútbol 5");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxTeams, setMaxTeams] = useState(8);
  const [prize, setPrize] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [signupsOpen, setSignupsOpen] = useState(true);

  // ----- Calendario de disponibilidad (mismo patrón que ReservaSection) -----
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => { const d = new Date(); d.setDate(1); return d; });
  const [busySlots, setBusySlots] = useState<Array<{ reservation_date: string }>>([]);

  const selectedCancha = useMemo(() => canchas.find(c => String(c.id) === legacyId) ?? null, [canchas, legacyId]);
  const schedule = useMemo(() => parseHours(selectedCancha?.hours), [selectedCancha]);

  useEffect(() => {
    if (!legacyId) { setBusySlots([]); return; }
    let active = true;
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const from = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const to = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    (async () => {
      const { data: c } = await supabase.from("canchas").select("id").eq("legacy_id", Number(legacyId)).maybeSingle();
      if (!c?.id || !active) return;
      const { data } = await supabase.rpc("get_cancha_busy_slots", { _cancha_id: c.id, _from: fmt(from), _to: fmt(to) });
      if (active) setBusySlots(((data as any[]) ?? []).map(r => ({ reservation_date: r.reservation_date })));
    })();
    return () => { active = false; };
  }, [legacyId, calendarMonth]);

  const fmtDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  const busyDays = useMemo(() => {
    const set = new Set<string>();
    for (const s of busySlots) set.add(s.reservation_date);
    return set;
  }, [busySlots]);

  const calendarDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const last = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const days: Array<{ date: Date | null }> = [];
    for (let i = 0; i < first.getDay(); i++) days.push({ date: null });
    for (let d = 1; d <= last.getDate(); d++) days.push({ date: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d) });
    while (days.length % 7 !== 0) days.push({ date: null });
    return days;
  }, [calendarMonth]);

  const handleDayClick = (key: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(key); setEndDate("");
    } else if (key < startDate) {
      setStartDate(key);
    } else {
      setEndDate(key);
    }
  };

  const inRange = (key: string) => startDate && endDate && key >= startDate && key <= endDate;
  const monthLabel = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];

  const handleSubmit = async () => {
    if (!name.trim() || !legacyId || !startDate || !endDate) {
      toast({ title: "Faltan datos", description: "Nombre, cancha y fechas son obligatorios", variant: "destructive" });
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast({ title: "Fechas inválidas", description: "La fecha de fin no puede ser antes que la de inicio", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: c } = await supabase.from("canchas").select("id").eq("legacy_id", Number(legacyId)).maybeSingle();
      if (!c?.id) throw new Error("Cancha no encontrada en la base de datos");
      const { data: busyReservations } = await supabase
        .from("reservations")
        .select("id")
        .eq("cancha_id", c.id)
        .eq("status", "confirmed")
        .gte("reservation_date", startDate)
        .lte("reservation_date", endDate)
        .limit(1);
      if (busyReservations?.length) throw new Error("Ya hay una reserva confirmada en esa cancha durante esas fechas. Elige otra cancha o rango.");
      await createTournament({
        cancha_id: c.id,
        organizer_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        format,
        start_date: startDate,
        end_date: endDate,
        max_teams: maxTeams,
        prize: prize.trim() || null,
        entry_fee: entryFee.trim() || null,
        contact_phone: contactPhone.trim() || null,
        signups_open: signupsOpen,
        status: "scheduled",
        banner_url: null,
      });
      toast({ title: "Torneo creado", description: "Ya está visible en la pestaña Torneos" });
      onCreated();
    } catch (e: any) {
      toast({ title: "Error", description: e.message ?? "No se pudo crear", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear torneo</DialogTitle>
          <DialogDescription>Programa un evento en una cancha. Las fechas seleccionadas bloquearán reservas normales.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nombre del torneo *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Copa Verano 2026" maxLength={80} />
          </div>

          <div>
            <Label>Cancha *</Label>
            <Select value={legacyId} onValueChange={setLegacyId}>
              <SelectTrigger><SelectValue placeholder="Selecciona la cancha" /></SelectTrigger>
              <SelectContent>
                {canchas.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Detalles, reglas, premios especiales..." maxLength={500} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fecha inicio *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Fecha fin *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Modalidad</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Fútbol 5", "Fútbol 6", "Fútbol 7", "Fútbol 8", "Fútbol 11"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cupo de equipos</Label>
              <Input type="number" min={2} max={64} value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Premio</Label>
              <Input value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="$500.000 + Trofeo" maxLength={120} />
            </div>
            <div>
              <Label>Inscripción</Label>
              <Input value={entryFee} onChange={(e) => setEntryFee(e.target.value)} placeholder="$50.000 por equipo" maxLength={80} />
            </div>
          </div>

          <div>
            <Label>Teléfono de contacto</Label>
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+57 300 000 0000" maxLength={30} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Permitir inscripciones</p>
              <p className="text-xs text-muted-foreground">Si está apagado, el torneo solo se anuncia (sin cupos abiertos).</p>
            </div>
            <Switch checked={signupsOpen} onCheckedChange={setSignupsOpen} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear torneo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentForm;
