import { useState, useEffect } from "react";
import { canchas } from "@/data/canchas";
import type { Cancha } from "@/data/canchas";
import { CalendarCheck, CheckCircle2, Mail, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Translation } from "@/lib/i18n";

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
  const [dbCanchas, setDbCanchas] = useState<Array<{ id: string; legacy_id: number | null; name: string; precio: string | null }>>([]);

  useEffect(() => { if (initialCancha) setCanchaId(String(initialCancha.id)); }, [initialCancha]);
  useEffect(() => {
    supabase.from("canchas").select("id, legacy_id, name, precio").order("legacy_id", { ascending: true }).then(({ data }) => {
      if (data?.length) setDbCanchas(data);
    });
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
    const canchaDb = dbCanchas.find((item) => item.id === canchaId || item.legacy_id === Number(canchaId));
    const cancha = canchas.find((item) => item.id === canchaDb?.legacy_id) ?? canchas.find((item) => item.id === Number(canchaId)) ?? canchas[0];
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

    const message = `Reserva de ${cancha.name}\nDirección: ${cancha.addr}\nFecha: ${fecha} ${hora}\nDuración: ${duracion}h\nModalidad: ${jugadores}`;
    try {
      await emailjs.send("service_nf4p2rr", "template_a4vyan5", {
        to_email: email, to_name: nombre, cancha_name: cancha.name, cancha_addr: cancha.addr,
        fecha, hora, duracion: `${duracion}h`, jugadores, extras: extras.join(", ") || "—",
        nota: nota || "—", precio: cancha.precio, phone: cancha.phone, message,
      }, "KPKZLlVPikmlp69eo");
    } catch (e) {
      console.error("EmailJS:", e);
    }
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
        <button onClick={handleSubmit} disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          <Mail className="h-4 w-4" /> {sending ? text.sending : text.submitReservation}
        </button>
      </div>
    </div>
  );
};

export default ReservaSection;
