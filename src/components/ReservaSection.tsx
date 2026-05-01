import { useState, useEffect, useMemo } from "react";
import { canchas as fallbackCanchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import { CalendarCheck, CheckCircle2, Mail, LogIn, Smartphone, Building2, CreditCard, Copy, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Translation } from "@/lib/i18n";
import { getCanchas, subscribeToCanchasChanges } from "@/lib/canchas-bd";
import { parseHours, parseModalidades, isOpenAt, isDayOpen, type Rango } from "@/lib/horarios-cancha";

interface ReservaSectionProps {
  initialCancha?: Cancha | null;
  text: Translation;
  user: User | null;
  onGoAccount: () => void;
}

const horas = ["06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM","10:00 PM"];

const convertHourTo24 = (value: string) => {
  const [time, modifier] = value.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = String(Number(hours) + 12);
  return `${hours.padStart(2, "0")}:${minutes}`;
};

// Parse "12:00AM-6:00PM" or "12:00 AM - 6:00 PM" into [startMinutes, endMinutes]
const parseRange = (raw: string): [number, number] | null => {
  const m = raw.replace(/\s+/g, "").toUpperCase().match(/(\d{1,2}):?(\d{2})?(AM|PM)-(\d{1,2}):?(\d{2})?(AM|PM)/);
  if (!m) return null;
  const toMin = (h: string, mm: string | undefined, ap: string) => {
    let hh = Number(h) % 12;
    if (ap === "PM") hh += 12;
    return hh * 60 + Number(mm || "0");
  };
  return [toMin(m[1], m[2], m[3]), toMin(m[4], m[5], m[6])];
};

const parsePrice = (raw: string): number => {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

const formatCOP = (n: number) => "$" + n.toLocaleString("es-CO");

const hourLabelToMinutes = (selectedHour: string): number => {
  const [t, ap] = selectedHour.split(" ");
  let [hh] = t.split(":").map(Number);
  if (hh === 12) hh = 0;
  if (ap === "PM") hh += 12;
  return hh * 60;
};

const priceAtMinutes = (
  hourlyPricing: Array<{ hour: string; price: string }> | undefined | null,
  minutes: number,
  fallbackText: string | null,
): number => {
  const m = ((minutes % 1440) + 1440) % 1440;
  if (Array.isArray(hourlyPricing)) {
    for (const slot of hourlyPricing) {
      if (!slot?.hour || !slot?.price) continue;
      const range = parseRange(slot.hour);
      if (!range) continue;
      const [s, e] = range;
      const inRange = s <= e ? (m >= s && m < e) : (m >= s || m < e);
      if (inRange) return parsePrice(slot.price);
    }
  }
  return parsePrice(fallbackText ?? "");
};

// Compute total considering each hourly block may have a different price
const computeBreakdown = (
  hourlyPricing: Array<{ hour: string; price: string }> | undefined | null,
  startHourLabel: string,
  durationHours: number,
  fallbackText: string | null,
): { total: number; perHour: Array<{ label: string; price: number }> } => {
  const startMin = hourLabelToMinutes(startHourLabel);
  const perHour: Array<{ label: string; price: number }> = [];
  let total = 0;
  for (let i = 0; i < durationHours; i++) {
    const m = (startMin + i * 60) % 1440;
    const price = priceAtMinutes(hourlyPricing, m, fallbackText);
    const hh24 = Math.floor(m / 60);
    const ap = hh24 >= 12 ? "PM" : "AM";
    const hh12 = ((hh24 + 11) % 12) + 1;
    perHour.push({ label: `${String(hh12).padStart(2, "0")}:00 ${ap}`, price });
    total += price;
  }
  return { total, perHour };
};

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const ReservaSection = ({ initialCancha, text, user, onGoAccount }: ReservaSectionProps) => {
  const { toast } = useToast();
  const [canchaId, setCanchaId] = useState<string>(initialCancha ? String(initialCancha.id) : "");
  const [nombre, setNombre] = useState(user?.user_metadata?.display_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [tel, setTel] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState(horas[0]);
  const [duracion, setDuracion] = useState("1");
  const [jugadores, setJugadores] = useState("Fútbol 5 (10 jug.)");
  const [extras, setExtras] = useState<string[]>([]);
  const [nota, setNota] = useState("");
  const [paymentMode, setPaymentMode] = useState<"partial" | "full">("partial");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastDeposit, setLastDeposit] = useState(0);
  const [canchas, setCanchas] = useState<Cancha[]>(fallbackCanchas);
  const [dbCanchas, setDbCanchas] = useState<Array<{ id: string; legacy_id: number | null; name: string; precio: string | null; hourly_pricing: any }>>([]);
  const [busySlots, setBusySlots] = useState<Array<{ reservation_date: string; start_time: string; duration_hours: number }>>([]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => { const d = new Date(); d.setDate(1); return d; });

  useEffect(() => { if (initialCancha) setCanchaId(String(initialCancha.id)); }, [initialCancha]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const [{ data }, rows] = await Promise.all([
        supabase.from("canchas").select("id, legacy_id, name, precio, hourly_pricing").order("legacy_id", { ascending: true }),
        getCanchas(),
      ]);
      if (!active) return;
      if (data?.length) setDbCanchas(data);
      setCanchas(rows);
    };
    load();
    const unsubscribe = subscribeToCanchasChanges(load);
    return () => { active = false; unsubscribe(); };
  }, []);
  useEffect(() => {
    if (user) {
      setNombre(user.user_metadata?.display_name ?? user.email ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  // Load busy slots for the selected court / visible month
  useEffect(() => {
    const cdb = dbCanchas.find((item) => item.id === canchaId || item.legacy_id === Number(canchaId));
    if (!cdb) { setBusySlots([]); return; }
    const from = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const to = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    let active = true;
    (async () => {
      const { data } = await supabase.rpc("get_cancha_busy_slots", {
        _cancha_id: cdb.id, _from: fmt(from), _to: fmt(to),
      });
      if (active) setBusySlots((data as any[]) ?? []);
    })();
    return () => { active = false; };
  }, [canchaId, dbCanchas, calendarMonth]);

  // Cancha seleccionada (objeto Cancha completo) y derivados (horario y modalidades)
  const selectedCancha = useMemo(() => {
    const cdb = dbCanchas.find((item) => item.id === canchaId || item.legacy_id === Number(canchaId));
    if (cdb) return canchas.find((c) => c.id === cdb.legacy_id) ?? null;
    return canchas.find((c) => String(c.id) === canchaId) ?? null;
  }, [canchaId, canchas, dbCanchas]);

  const schedule = useMemo(() => parseHours(selectedCancha?.hours), [selectedCancha]);
  const modalidades = useMemo(() => parseModalidades(selectedCancha?.tipo), [selectedCancha]);

  // Cuando cambia la cancha, ajustar la modalidad por defecto si la actual no aplica.
  useEffect(() => {
    if (modalidades.length && !modalidades.includes(jugadores)) {
      setJugadores(modalidades[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCancha?.id]);

  if (!user) {
    return (
      <div className="section-sport-panel rounded-[22px] p-8 text-center">
        <LogIn className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h2 className="mb-2 text-xl font-bold text-foreground">{text.loginToReserve}</h2>
        <p className="mb-5 text-sm text-muted-foreground">{text.loginToReserveDesc}</p>
        <button onClick={onGoAccount} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{text.goToAccount}</button>
      </div>
    );
  }

  const toggleExtra = (e: string) => setExtras((prev) => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const handleSubmit = async () => {
    if (!nombre || !email || !tel || !fecha || canchaId === "") {
      toast({ title: text.errorTitle, description: text.completeAllFields, variant: "destructive" });
      return;
    }
    if (fecha < todayISO()) {
      toast({ title: text.errorTitle, description: text.pastDateError, variant: "destructive" });
      return;
    }
    // Validar horario de la cancha
    const selDate = new Date(`${fecha}T00:00:00`);
    const dur = Number(duracion) || 1;
    const startMin = hourLabelToMinutes(hora);
    let withinSchedule = true;
    for (let i = 0; i < dur; i++) {
      if (!isOpenAt(schedule, selDate, (startMin + i * 60) % 1440)) { withinSchedule = false; break; }
    }
    if (!withinSchedule) {
      toast({ title: text.errorTitle, description: text.outsideHoursLabel, variant: "destructive" });
      return;
    }
    const canchaDb = dbCanchas.find((item) => item.id === canchaId || item.legacy_id === Number(canchaId));
    const cancha = canchas.find((item) => item.id === canchaDb?.legacy_id) ?? canchas.find((item) => item.id === Number(canchaId)) ?? fallbackCanchas[0];
    setSending(true);
    if (!canchaDb) {
      toast({ title: text.errorTitle, description: "Cancha no disponible", variant: "destructive" });
      setSending(false); return;
    }
    const { error: reservationError } = await supabase.from("reservations").insert({
      cancha_id: canchaDb.id,
      user_id: user.id,
      customer_name: nombre,
      customer_email: email,
      customer_phone: tel,
      reservation_date: fecha,
      start_time: `${convertHourTo24(hora)}:00`,
      duration_hours: Number(duracion) || 1,
      format_label: jugadores,
      extras,
      note: nota || null,
    });
    if (reservationError) {
      toast({ title: text.slotUnavailable, description: text.slotUnavailableDesc, variant: "destructive" });
      setSending(false); return;
    }

    const breakdown = computeBreakdown(canchaDb.hourly_pricing as any, hora, dur, canchaDb.precio);
    const totalPrice = breakdown.total;
    const avgPerHour = dur > 0 ? Math.round(totalPrice / dur) : totalPrice;
    const deposit = Math.round(totalPrice * 0.30);
    const remaining = totalPrice - deposit;
    const desglose = breakdown.perHour.map(p => `${p.label}: ${formatCOP(p.price)}`).join(" | ");
    const precioStr = totalPrice > 0
      ? `Desglose: ${desglose} · Total ${formatCOP(totalPrice)} · Depósito 30%: ${formatCOP(deposit)} · Saldo en sitio: ${formatCOP(remaining)}`
      : (cancha.precio ?? "—");

    const message = `Reserva de ${cancha.name}\nDirección: ${cancha.addr}\nFecha: ${fecha} ${hora}\nDuración: ${dur}h\nModalidad: ${jugadores}\n\nDesglose por hora:\n${breakdown.perHour.map(p => `  • ${p.label}: ${formatCOP(p.price)}`).join("\n")}\n\nTotal: ${formatCOP(totalPrice)}\nPago parcial requerido (30%): ${formatCOP(deposit)}\nSaldo a pagar en sitio: ${formatCOP(remaining)}`;
    try {
      await emailjs.send("service_nf4p2rr", "template_a4vyan5", {
        to_email: email, to_name: nombre, cancha_name: cancha.name, cancha_addr: cancha.addr,
        fecha, hora, duracion: `${dur}h`, jugadores, extras: extras.join(", ") || "—",
        nota: nota || "—", precio: precioStr, phone: cancha.phone, message,
        precio_hora: formatCOP(avgPerHour),
        precio_total: formatCOP(totalPrice),
        deposito: formatCOP(deposit),
        saldo: formatCOP(remaining),
        desglose,
      }, "KPKZLlVPikmlp69eo");
    } catch (e) {
      console.error("EmailJS:", e);
    }
    setLastDeposit(deposit);
    setLastTotal(totalPrice);
    setSent(true);
    setSending(false);
  };

  if (sent) {
    const copyToClipboard = (txt: string) => {
      navigator.clipboard?.writeText(txt);
      toast({ title: text.copied, description: txt });
    };
    const methods = [
      { name: "Nequi", icon: <Smartphone className="h-4 w-4" />, num: "300 123 4567", color: "border-pink-500/40 bg-pink-500/5", url: "https://www.nequi.com.co" },
      { name: "Daviplata", icon: <Smartphone className="h-4 w-4" />, num: "301 234 5678", color: "border-red-500/40 bg-red-500/5", url: "https://www.daviplata.com" },
      { name: "Bancolombia", icon: <Building2 className="h-4 w-4" />, num: "Ahorros 123-456789-00", color: "border-yellow-500/40 bg-yellow-500/5", url: "https://www.bancolombia.com" },
      { name: "PSE", icon: <CreditCard className="h-4 w-4" />, num: "Banco / cuenta vinculada", color: "border-blue-500/40 bg-blue-500/5", url: "https://www.pse.com.co" },
    ];
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-accent" />
          <h3 className="mb-1 text-xl font-bold text-foreground">{text.reservationSent}</h3>
          <p className="text-sm text-muted-foreground">{text.reservationSentDesc} <strong>{email}</strong></p>
        </div>

        <div className="rounded-xl border border-primary/30 bg-card p-4 sm:p-5">
          <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-foreground">
            <CreditCard className="h-5 w-5 text-primary" /> {text.paymentMethods}
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">{text.choosePayment}</p>

          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => setPaymentMode("partial")}
              className={`rounded-lg border p-3 text-left text-sm transition ${paymentMode === "partial" ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}
            >
              <p className="font-semibold text-foreground">{text.partialPayment}</p>
              <p className="text-xs text-muted-foreground">{text.partialPaymentDesc}</p>
            </button>
            <button
              onClick={() => setPaymentMode("full")}
              className={`rounded-lg border p-3 text-left text-sm transition ${paymentMode === "full" ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}
            >
              <p className="font-semibold text-foreground">{text.fullPayment}</p>
              <p className="text-xs text-muted-foreground">{text.fullPaymentDesc}</p>
            </button>
          </div>

          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{text.totalReservation}:</span><strong className="text-foreground">{formatCOP(lastTotal)}</strong></div>
            {paymentMode === "partial" ? (
              <>
                <div className="flex justify-between"><span className="text-primary">{text.partialPayment}:</span><strong className="text-primary">{formatCOP(lastDeposit)}</strong></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{text.balanceAtSite}:</span><span className="text-muted-foreground">{formatCOP(lastTotal - lastDeposit)}</span></div>
              </>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-primary">{text.payNow} (100%):</span><strong className="text-primary">{formatCOP(lastTotal)}</strong></div>
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{text.balanceAtSite}:</span><span className="text-muted-foreground">$0</span></div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <div key={m.name} className={`rounded-lg border p-3 ${m.color}`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">{m.icon} {m.name}</div>
                  <button onClick={() => copyToClipboard(m.num)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Copy className="h-3 w-3" /> {text.copy}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground break-words">{m.num}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{text.amountLabel}: <strong className="text-foreground">{formatCOP(paymentMode === "partial" ? lastDeposit : lastTotal)}</strong></p>
                <a
                  href={m.url} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
                >
                  <ExternalLink className="h-3 w-3" /> {text.payOnlineLink}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{text.paymentInstructions}</p>
        </div>

        <button onClick={() => { setSent(false); setTel(""); setFecha(""); setNota(""); setExtras([]); }} className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{text.makeAnother}</button>
      </motion.div>
    );
  }

  const inputClass = "w-full rounded-lg border border-border bg-card p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  const labelClass = "mb-1.5 block text-sm font-medium text-muted-foreground";

  // Compute set of occupied hour-labels for selected date based on busySlots
  const minutesToHourLabel = (m: number) => {
    const hh24 = Math.floor(m / 60);
    const ap = hh24 >= 12 ? "PM" : "AM";
    const hh12 = ((hh24 + 11) % 12) + 1;
    return `${String(hh12).padStart(2, "0")}:00 ${ap}`;
  };
  const occupiedHourLabels = useMemo(() => {
    const set = new Set<string>();
    if (!fecha) return set;
    for (const slot of busySlots) {
      if (slot.reservation_date !== fecha) continue;
      const [hh, mm] = slot.start_time.split(":").map(Number);
      const start = hh * 60 + (mm || 0);
      for (let i = 0; i < (slot.duration_hours || 1); i++) {
        set.add(minutesToHourLabel(start + i * 60));
      }
    }
    return set;
  }, [fecha, busySlots]);

  // Day-status map for visible month (key = "YYYY-MM-DD")
  const dayStatuses = useMemo(() => {
    const map = new Map<string, { occupied: number }>();
    for (const slot of busySlots) {
      const prev = map.get(slot.reservation_date) ?? { occupied: 0 };
      prev.occupied += slot.duration_hours || 1;
      map.set(slot.reservation_date, prev);
    }
    return map;
  }, [busySlots]);

  const totalSlotsPerDay = horas.length;
  const fmtDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today0 = new Date(); today0.setHours(0, 0, 0, 0);

  // Build calendar grid (weeks)
  const calendarDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const last = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
    const startWeekday = first.getDay(); // 0 Sun .. 6 Sat
    const days: Array<{ date: Date | null }> = [];
    for (let i = 0; i < startWeekday; i++) days.push({ date: null });
    for (let d = 1; d <= last.getDate(); d++) days.push({ date: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d) });
    while (days.length % 7 !== 0) days.push({ date: null });
    return days;
  }, [calendarMonth]);

  const monthLabel = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="section-sport-panel rounded-[22px] p-4 sm:p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"><CalendarCheck className="h-5 w-5 text-primary" /> {text.bookYourCourtTitle}</h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div>
          <label className={labelClass}>{text.court}</label>
          <select value={canchaId} onChange={(e) => setCanchaId(e.target.value)} className={inputClass}>
            <option value="">{text.selectCourtPlaceholder}</option>
            {dbCanchas.length > 0
              ? dbCanchas.map((c) => <option key={c.id} value={c.id}>{c.name} – {c.precio}</option>)
              : canchas.map((c) => <option key={c.id} value={String(c.id)}>{c.name} – {c.precio}</option>)}
          </select>
        </div>

        {canchaId && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="rounded-md border border-border bg-card p-1.5 hover:bg-accent">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold capitalize text-foreground">{text.availabilityCalendar} · {monthLabel}</p>
              <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="rounded-md border border-border bg-card p-1.5 hover:bg-accent">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
              {weekDays.map((d, i) => <div key={i}>{d}</div>)}
            </div>
            {selectedCancha?.hours && (
              <p className="mb-2 text-[11px] text-muted-foreground"><strong className="text-foreground">{text.courtScheduleLabel}:</strong> {selectedCancha.hours}</p>
            )}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, idx) => {
                if (!cell.date) return <div key={idx} />;
                const key = fmtDay(cell.date);
                const isPast = cell.date < today0;
                const dayOpen = isDayOpen(schedule, cell.date);
                const occ = dayStatuses.get(key)?.occupied ?? 0;
                const allBusy = occ >= totalSlotsPerDay;
                const someBusy = occ > 0 && !allBusy;
                const selected = fecha === key;
                let cls = "border-border bg-card text-foreground hover:bg-accent";
                if (isPast) cls = "border-border bg-muted text-muted-foreground/50 cursor-not-allowed";
                else if (!dayOpen) cls = "border-border bg-muted/60 text-muted-foreground/60 cursor-not-allowed [background-image:repeating-linear-gradient(45deg,transparent,transparent_3px,hsl(var(--muted-foreground)/0.15)_3px,hsl(var(--muted-foreground)/0.15)_5px)]";
                else if (allBusy) cls = "border-red-500/50 bg-red-500/15 text-red-600 dark:text-red-400 cursor-not-allowed";
                else if (someBusy) cls = "border-orange-500/50 bg-orange-500/15 text-orange-700 dark:text-orange-300 hover:bg-orange-500/25";
                else cls = "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20";
                if (selected) cls += " ring-2 ring-primary";
                return (
                  <button
                    key={idx} type="button"
                    disabled={isPast || allBusy || !dayOpen}
                    onClick={() => setFecha(key)}
                    className={`aspect-square rounded-md border text-xs font-semibold transition ${cls}`}
                    title={!dayOpen ? text.courtClosedDay : undefined}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
              <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500/70 align-middle" />{text.legendAvailable}</li>
              <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-orange-500/70 align-middle" />{text.legendSomeBusy}</li>
              <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-red-500/70 align-middle" />{text.legendAllBusy}</li>
              <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-muted align-middle" />{text.legendPast}</li>
              <li className="sm:col-span-2"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-muted-foreground/30 align-middle" />{text.legendClosedDay}</li>
            </ul>

            {fecha ? (() => {
              const selDate = new Date(`${fecha}T00:00:00`);
              const dayOpen = isDayOpen(schedule, selDate);
              if (!dayOpen) {
                return <p className="mt-3 text-xs text-red-500">{text.courtClosedDay}</p>;
              }
              return (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold text-foreground">{fecha}</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {horas.map((h) => {
                      const isOcc = occupiedHourLabels.has(h);
                      const mins = hourLabelToMinutes(h);
                      const inSchedule = isOpenAt(schedule, selDate, mins);
                      const isSel = hora === h && !isOcc && inSchedule;
                      const disabled = isOcc || !inSchedule;
                      let cls = "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300";
                      if (isSel) cls = "border-primary bg-primary text-primary-foreground";
                      else if (isOcc) cls = "border-red-500/50 bg-red-500/15 text-red-600 dark:text-red-400 cursor-not-allowed";
                      else if (!inSchedule) cls = "border-border bg-muted/40 text-muted-foreground/60 cursor-not-allowed";
                      return (
                        <button
                          key={h} type="button"
                          disabled={disabled}
                          onClick={() => !disabled && setHora(h)}
                          className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold transition ${cls}`}
                          title={!inSchedule ? text.outsideHoursLabel : undefined}
                        >
                          {h} · {!inSchedule ? text.outsideHoursLabel : isOcc ? text.occupied : text.available}
                        </button>
                      );
                    })}
                  </div>
                  {horas.every((h) => occupiedHourLabels.has(h) || !isOpenAt(schedule, selDate, hourLabelToMinutes(h))) && (
                    <p className="mt-2 text-xs text-red-500">{text.noHoursAvailable}</p>
                  )}
                </div>
              );
            })() : (
              <p className="mt-3 text-xs text-muted-foreground">{text.pickDateToSeeHours}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>{text.fullNameLabel}</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={text.yourName} className={inputClass} /></div>
          <div><label className={labelClass}>{text.emailLabel}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={text.emailPlaceholder} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>{text.cellphone}</label><input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder={text.cellphonePlaceholder} className={inputClass} /></div>
          <div><label className={labelClass}>{text.date}</label><input type="date" value={fecha} min={todayISO()} onChange={(e) => setFecha(e.target.value)} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{text.hour}</label>
            <select value={hora} onChange={(e) => setHora(e.target.value)} className={inputClass}>
              {horas.map(h => {
                const mins = hourLabelToMinutes(h);
                const selDate = fecha ? new Date(`${fecha}T00:00:00`) : null;
                const inSch = selDate ? isOpenAt(schedule, selDate, mins) : true;
                const occ = occupiedHourLabels.has(h);
                const dis = occ || !inSch;
                const suffix = !inSch ? ` · ${text.outsideHoursLabel}` : occ ? ` · ${text.occupied}` : "";
                return <option key={h} value={h} disabled={dis}>{h}{suffix}</option>;
              })}
            </select>
          </div>
          <div><label className={labelClass}>{text.duration}</label><select value={duracion} onChange={(e) => setDuracion(e.target.value)} className={inputClass}><option value="1">{text.hour1}</option><option value="2">{text.hour2}</option><option value="3">{text.hour3}</option></select></div>
        </div>
        <div>
          <label className={labelClass}>{text.modality}</label>
          <select value={jugadores} onChange={(e) => setJugadores(e.target.value)} className={inputClass}>
            {modalidades.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {selectedCancha?.tipo && (
            <p className="mt-1 text-[11px] text-muted-foreground">{selectedCancha.tipo}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>{text.extraServices}</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {[text.vest, text.ball, text.nightLighting, text.lockerRoom, text.coveredCourt, text.eventTournament].map((e) => (
              <label key={e} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
                <input type="checkbox" checked={extras.includes(e)} onChange={() => toggleExtra(e)} className="accent-primary" /> {e}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>{text.additionalNote}</label>
          <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder={text.notePlaceholder} className={`${inputClass} min-h-[80px] resize-y`} />
        </div>
        {(() => {
          const cdb = dbCanchas.find((item) => item.id === canchaId || item.legacy_id === Number(canchaId));
          if (!cdb) return null;
          const dur = Number(duracion) || 1;
          const bd = computeBreakdown(cdb.hourly_pricing as any, hora, dur, cdb.precio);
          if (bd.total <= 0) return null;
          const dep = Math.round(bd.total * 0.30);
          const varies = new Set(bd.perHour.map(p => p.price)).size > 1;
          return (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <p className="mb-1 font-semibold text-foreground">{text.paymentSummary}</p>
              <ul className="mb-1 space-y-0.5 text-xs text-muted-foreground">
                {bd.perHour.map((p, i) => (
                  <li key={i} className="flex justify-between"><span>{p.label}</span><span className="text-foreground">{formatCOP(p.price)}</span></li>
                ))}
              </ul>
              {varies && <p className="text-[11px] text-primary">{text.variesByHour}</p>}
              <p className="text-foreground">{text.totalLabel}: <strong>{formatCOP(bd.total)}</strong></p>
              <p className="text-primary">{text.partialPaymentRequired}: <strong>{formatCOP(dep)}</strong></p>
              <p className="text-xs text-muted-foreground">{text.remainingAtSite}: {formatCOP(bd.total - dep)}</p>
            </div>
          );
        })()}
        <button onClick={handleSubmit} disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          <Mail className="h-4 w-4" /> {sending ? text.sending : text.submitReservation}
        </button>
      </div>
    </div>
  );
};

export default ReservaSection;
