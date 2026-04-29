import { useState, useEffect } from "react";
import { canchas as fallbackCanchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import { CalendarCheck, CheckCircle2, Mail, LogIn, Smartphone, Building2, CreditCard, Copy } from "lucide-react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Translation } from "@/lib/i18n";
import { getCanchas, subscribeToCanchasChanges } from "@/lib/canchas-bd";

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
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [canchas, setCanchas] = useState<Cancha[]>(fallbackCanchas);
  const [dbCanchas, setDbCanchas] = useState<Array<{ id: string; legacy_id: number | null; name: string; precio: string | null; hourly_pricing: any }>>([]);

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
      toast({ title: text.errorTitle, description: "No puedes reservar en fechas pasadas.", variant: "destructive" });
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

    const dur = Number(duracion) || 1;
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
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-accent/30 bg-accent/10 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-accent" />
        <h3 className="mb-2 text-xl font-bold text-foreground">{text.reservationSent}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{text.reservationSentDesc} <strong>{email}</strong></p>
        <button onClick={() => { setSent(false); setTel(""); setFecha(""); setNota(""); setExtras([]); }} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{text.makeAnother}</button>
      </motion.div>
    );
  }

  const inputClass = "w-full rounded-lg border border-border bg-card p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  const labelClass = "mb-1.5 block text-sm font-medium text-muted-foreground";

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"><CalendarCheck className="h-5 w-5 text-primary" /> {text.bookYourCourtTitle}</h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <label className={labelClass}>{text.court}</label>
          <select value={canchaId} onChange={(e) => setCanchaId(e.target.value)} className={inputClass}>
            <option value="">{text.selectCourtPlaceholder}</option>
            {dbCanchas.length > 0
              ? dbCanchas.map((c) => <option key={c.id} value={c.id}>{c.name} – {c.precio}</option>)
              : canchas.map((c) => <option key={c.id} value={String(c.id)}>{c.name} – {c.precio}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>{text.fullNameLabel}</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={text.yourName} className={inputClass} /></div>
          <div><label className={labelClass}>{text.emailLabel}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={text.emailPlaceholder} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>{text.cellphone}</label><input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder={text.cellphonePlaceholder} className={inputClass} /></div>
          <div><label className={labelClass}>{text.date}</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className={labelClass}>{text.hour}</label><select value={hora} onChange={(e) => setHora(e.target.value)} className={inputClass}>{horas.map(h => <option key={h}>{h}</option>)}</select></div>
          <div><label className={labelClass}>{text.duration}</label><select value={duracion} onChange={(e) => setDuracion(e.target.value)} className={inputClass}><option value="1">{text.hour1}</option><option value="2">{text.hour2}</option><option value="3">{text.hour3}</option></select></div>
        </div>
        <div>
          <label className={labelClass}>{text.modality}</label>
          <select value={jugadores} onChange={(e) => setJugadores(e.target.value)} className={inputClass}>
            <option>Fútbol 5 (10 jug.)</option><option>Fútbol 6 (12 jug.)</option><option>Fútbol 7 (14 jug.)</option><option>Fútbol 8 (16 jug.)</option>
          </select>
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
          const pph = priceForHour(cdb.hourly_pricing as any, hora, cdb.precio);
          if (pph <= 0) return null;
          const total = pph * dur;
          const dep = Math.round(total * 0.30);
          return (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <p className="mb-1 font-semibold text-foreground">Resumen de pago</p>
              <p className="text-muted-foreground">Tarifa para <strong className="text-foreground">{hora}</strong>: {formatCOP(pph)}/hora × {dur}h</p>
              <p className="text-foreground">Total: <strong>{formatCOP(total)}</strong></p>
              <p className="text-primary">Pago parcial requerido (30%): <strong>{formatCOP(dep)}</strong></p>
              <p className="text-xs text-muted-foreground">Saldo restante en sitio: {formatCOP(total - dep)}</p>
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
