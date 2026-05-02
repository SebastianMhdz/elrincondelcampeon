import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { canchas as canchasBase, type Cancha } from "@/data/canchas";
import { getCanchas, subscribeToCanchasChanges } from "@/lib/canchas-bd";
import { Phone, MessageCircle, Send, CheckCircle2, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Translation } from "@/lib/i18n";
import { cleanVisibleText } from "@/lib/utils";

const SoporteSection = ({ text }: { text: Translation }) => {
  const { toast } = useToast();
  const [asunto, setAsunto] = useState(text.reservationProblem);
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sent, setSent] = useState(false);
  const [telCancha, setTelCancha] = useState("");
  const [waCancha, setWaCancha] = useState("");
  const [canchas, setCanchas] = useState<Cancha[]>(canchasBase);
  const [requests, setRequests] = useState<Array<{ id: string; subject: string; message: string; status: string; admin_notes: string | null; created_at: string }>>([]);

  const loadRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setRequests([]); return; }
    const { data } = await supabase.from("support_reports").select("id, subject, message, status, admin_notes, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    setRequests((data as typeof requests) ?? []);
  };

  useEffect(() => {
    loadRequests();
    getCanchas().then(setCanchas);
    const unsubscribeCanchas = subscribeToCanchasChanges(() => getCanchas().then(setCanchas));
    const channel = supabase.channel("mis-reportes-soporte")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_reports" }, loadRequests)
      .subscribe();
    return () => {
      unsubscribeCanchas();
      supabase.removeChannel(channel);
    };
  }, []);

  const llamar = () => {
    if (!telCancha) { toast({ title: text.selectCourtShort, variant: "destructive" }); return; }
    window.open(`tel:${canchas.find((c) => String(c.id) === telCancha)?.phone ?? ""}`);
  };
  const abrirWA = () => {
    if (!waCancha) { toast({ title: text.selectCourtShort, variant: "destructive" }); return; }
    const c = canchas.find((cancha) => String(cancha.id) === waCancha);
    if (!c) return;
    window.open(`https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola! Info sobre ${c.name}.`)}`, "_blank");
  };
  const enviar = async () => {
    const safeName = cleanVisibleText(nombre, true);
    const safeMessage = cleanVisibleText(mensaje, true);
    const safeSubject = cleanVisibleText(asunto, true);
    if (!safeName || !safeMessage) { toast({ title: text.completeNameMessage, variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const safeEmail = contacto.includes("@") ? contacto.trim() : user?.email ?? "usuario@sin-correo.local";
    const { error } = await supabase.from("support_reports").insert({
      user_id: user?.id ?? null,
      name: safeName,
      email: safeEmail,
      subject: safeSubject,
      message: safeMessage,
      category: "general",
    });
    if (error) { toast({ title: text.errorTitle, description: error.message, variant: "destructive" }); return; }
    setSent(true);
    loadRequests();
  };

  const inputClass = "w-full rounded-lg border border-border bg-card p-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";
  const labelClass = "mb-1.5 block text-sm font-medium text-muted-foreground";

  return (
    <div className="section-sport-panel rounded-[22px] p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{text.supportContact}</h2>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <Phone className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="mb-1 text-sm font-semibold text-foreground">{text.directCall}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{text.callAdmin}</p>
          <select value={telCancha} onChange={(e) => setTelCancha(e.target.value)} className={`${inputClass} mb-2 text-xs`}>
            <option value="">{text.selectCourtShort}</option>
            {canchas.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <button onClick={llamar} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">{text.callNow}</button>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <MessageCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="mb-1 text-sm font-semibold text-foreground">{text.whatsappCard}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{text.writeBusiness}</p>
          <select value={waCancha} onChange={(e) => setWaCancha(e.target.value)} className={`${inputClass} mb-2 text-xs`}>
            <option value="">{text.selectCourtShort}</option>
            {canchas.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <button onClick={abrirWA} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">{text.openWhatsapp}</button>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center sm:col-span-2">
          <MessageCircle className="mx-auto mb-2 h-8 w-8 text-accent" />
          <h3 className="mb-1 text-sm font-semibold text-foreground">{text.whatsappDirectOwner}</h3>
          <p className="mb-3 text-xs text-muted-foreground">{text.whatsappDirectOwnerDesc}</p>
          <a
            href="https://wa.me/57301479033?text=Hola!%20Necesito%20ayuda%20con%20El%20Rinc%C3%B3n%20Del%20Campe%C3%B3n."
            target="_blank" rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            {text.openWhatsapp} · +57 301 479 033
          </a>
        </div>
      </div>
      {sent ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-accent" />
          <h3 className="mb-1 text-lg font-bold text-foreground">{text.messageSent}</h3>
          <p className="text-sm text-muted-foreground">{text.willReplySoon}</p>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">{text.supportForm}</h3>
          <div>
            <label className={labelClass}>{text.subject}</label>
            <select value={asunto} onChange={(e) => setAsunto(e.target.value)} className={inputClass}>
              <option>{text.reservationProblem}</option><option>{text.serviceComplaint}</option><option>{text.priceQuery}</option><option>{text.requestInfo}</option><option>{text.other}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className={labelClass}>{text.name}</label><input value={nombre} onChange={(e) => setNombre(cleanVisibleText(e.target.value))} placeholder={text.yourName} className={inputClass} /></div>
            <div><label className={labelClass}>{text.contactInfo}</label><input value={contacto} onChange={(e) => setContacto(e.target.value)} className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>{text.message}</label>
            <textarea value={mensaje} onChange={(e) => setMensaje(cleanVisibleText(e.target.value))} placeholder={text.describeQuery} className={`${inputClass} min-h-[80px] resize-y`} />
          </div>
          <button onClick={enviar} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Send className="h-4 w-4" /> {text.sendMessage}
          </button>
        </div>
      )}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Inbox className="h-4 w-4 text-primary" /> {text.mySupportRequests}</h3>
        {requests.length === 0 ? <p className="text-xs italic text-muted-foreground">{text.noReportsYet}</p> : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <li key={request.id} className="rounded-lg border border-border bg-background/50 p-3 text-sm">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="truncate font-semibold text-foreground">{request.subject}</p><p className="text-[10px] text-muted-foreground">{new Date(request.created_at).toLocaleString()}</p></div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">{request.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{request.message}</p>
                <div className="mt-3 rounded-lg border border-border bg-card p-3">
                  <p className="mb-1 text-xs font-semibold text-foreground">{text.teamReply}</p>
                  <p className="text-xs text-muted-foreground">{request.admin_notes || text.noTeamReplyYet}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SoporteSection;
